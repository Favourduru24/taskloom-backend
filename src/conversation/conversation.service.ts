import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { scheduleReminder } from 'src/lib/reminder';
import { UpdateAiMemoryDto } from './dto/update-ai-memory.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ReminderStatus, ReminderType } from '@prisma/client';

interface ConversationAIResponse {
   summary: string;
   reply: { required: boolean; message: string}
   followUp: { required: boolean; reason: string; days: number | null}
   }

interface ConversationAIResponse {
    whoIsThisPerson: string;
    relationshipSummary: string;
    lastPromise: string;
    nextAction: string;
  }
  

@Injectable()
export class ConversationService {

    constructor (private readonly logger: LoggerService, private readonly prisma: PrismaService) {}
    
    async createConversation(
      userId: string,
      contactId: string,
      workspaceId: string,
      dto: CreateConversationDto,
    ) {
      const { generateText } = await import("ai");
      const { google } = await import("@ai-sdk/google");
    
      this.logger.log(
        `Creating conversation from ${dto.source} by ${userId}`,
        "ConversationService",
      );
    
      const preference = await this.prisma.contactPreference.findUnique({
        where: {
          userId_contactId: {
            userId,
            contactId,
          },
        },
      });
    
      if (!preference) {
        throw new NotFoundException("Contact preference not found.");
      }
    
      // 1. Analyze conversation with AI
    
      const response = await generateText({
        model: google("gemini-2.5-flash"), 
        maxRetries: 0,
        prompt: `
    You are an AI Conversation Assistant.
    
    Analyze ONLY this latest conversation:
    
    "${dto.content}"
    
    Do not invent information.
    
    Your responsibilities:
    
    1. Summarize the conversation.
    2. Determine whether the sender requires a reply.
    3. If a reply is required, draft a natural reply.
    4. Determine whether the conversation contains an explicit or strongly implied request for a future follow-up.
    5. If a follow-up is required, determine the number of days until the follow-up.
    6. Pay special attention to explicit time requests such as:
       - "get back to me in 3 days"
       - "contact me tomorrow"
       - "reach out next week"
       - "follow up in two weeks"
    7. If no follow-up is requested, return required as false.
    8. Never invent a reminder.
    
    Return ONLY valid JSON.
    
    {
      "summary": "",
      "reply": {
        "required": false,
        "message": ""
      },
      "followUp": {
        "required": false,
        "reason": "",
        "days": null
      }
    }
    `,
      });
    
      // 2. Parse AI response
    
      const data = this.parseMarkdownToJson<ConversationAIResponse>(response.text);
    
      if (!data) {
        throw new Error("Invalid AI JSON format");
      }
    
      // Validate AI response
      if (
        typeof data.summary !== "string" ||
        typeof data.reply?.required !== "boolean" ||
        typeof data.followUp?.required !== "boolean"
      ) {
        throw new Error("Invalid AI response structure");
      }
    
      // 3. Database transaction
    
      const conversation = await this.prisma.$transaction(async (tx) => {
    
        // Create conversation

        const conversation = await tx.conversation.create({
          data: {
            contactId,
            content: dto.content,
            source: dto.source,
            summary: data.summary,
            response: data.reply?.required ? data.reply.message : null,
            analyzed: true
          },
        });
    
        // AI-requested reminder
    
        if (
          data.followUp?.required &&
          typeof data.followUp.days === "number" &&
          data.followUp.days > 0
        ) {
          await tx.reminder.create({
            data: {
              userId,
              contactId,
              workspaceId,
              conversationId: conversation.id,
              timezone: preference.timezone ?? "UTC",
              status: ReminderStatus.PENDING,
              type: ReminderType.ONETIME,
    
              scheduledFor: scheduleReminder(
                "CUSTOM",
                data.followUp.days,
                new Date(),
              ),
    
              message:
                data.followUp.reason ||
                `Follow-up requested in ${data.followUp.days} days`,
            },
          });
        }  

        return conversation;
      });
    
      return {
        conversation,
        ai: {
          summary: data.summary,
          reply: data.reply,
          followUp: data.followUp,
        },
      };
    }

    async updateAiMemory(
      contactId: string,
      dto: UpdateAiMemoryDto,
    ) {
      this.logger.log(
        `Updating AI memory for contact ${contactId}`,
        'AI Memory Manager',
      );
    
      if (!dto.recentConversation?.trim()) {
        throw new BadRequestException(
          'Recent conversation is required',
        );
      }
    
      // Get existing AI memory
      const existingMemory = await this.prisma.aiMemory.findUnique({
        where: {
          contactId,
        },
      });
    
      if (!existingMemory) {
        throw new NotFoundException(
          `AI memory not found for contact ${contactId}`,
        );
      }
    
      const { google } = await import('@ai-sdk/google');
      const { generateText } = await import('ai');
    
      const response = await generateText({
        model: google('gemini-2.5-flash'),
        maxRetries: 0,
    
        prompt: `
    You are an AI Relationship Manager.
    
    Your job is to maintain long-term relationship memory.
    
    Compare the EXISTING AI MEMORY with the NEW CONVERSATION
    and return the updated memory.
    
    Rules:
    - Preserve existing memory that is still accurate.
    - Update facts only when the new conversation provides evidence.
    - Add useful, durable relationship information.
    - Never invent or assume facts.
    - Ignore small talk and irrelevant details.
    - Do not store the conversation itself.
    - Detect new or changed promises.
    - Remove promises that are fulfilled or no longer relevant.
    - Suggest a next action only when one is genuinely needed.
    - Do not suggest a follow-up date or time.
    - If nothing meaningful changed, preserve the existing memory.
    - Return only valid JSON.
    
    EXISTING AI MEMORY:
    ${JSON.stringify(
      {
        whoIsThisPerson: existingMemory.whoIsThisPerson,
        relationshipSummary: existingMemory.relationshipSummary,
        lastPromise: existingMemory.lastPromise,
        nextAction: existingMemory.nextAction,
      },
      null,
      2,
    )}
    
    NEW CONVERSATION:
    ${dto.recentConversation}
    
    Return exactly:
    {
      "whoIsThisPerson": "",
      "relationshipSummary": "",
      "lastPromise": "",
      "nextAction": ""
    }
    `,
      });
    
      const data =
        this.parseMarkdownToJson<ConversationAIResponse>(
          response.text,
        );
    
      if (!data) {
        this.logger.error(
          `Invalid AI memory response for contact ${contactId}`,
          'AI Memory Manager',
        );
    
        throw new BadRequestException(
          'AI returned an invalid memory format',
        );
      }
    
      if (
        typeof data.whoIsThisPerson !== 'string' ||
        typeof data.relationshipSummary !== 'string' ||
        typeof data.lastPromise !== 'string' ||
        typeof data.nextAction !== 'string'
      ) {
        throw new BadRequestException(
          'AI returned an invalid memory structure',
        );
      }
    
      // Update existing AI memory
      const updatedMemory = await this.prisma.aiMemory.update({
        where: {
          contactId,
        },
        data: {
          whoIsThisPerson: data.whoIsThisPerson,
          relationshipSummary: data.relationshipSummary,
          lastPromise: data.lastPromise,
          nextAction: data.nextAction,
        },
      });
    
      this.logger.log(
        `AI memory successfully updated for contact ${contactId}`,
        'AI Memory Manager',
      );
    
      return updatedMemory;
    }

    async updateConversation(conversationId: string, contactId: string, dto: UpdateConversationDto) {
        
       const conversationOwner = await this.prisma.conversation.findFirst({where: {id: conversationId, contactId: contactId}})

       if(!conversationOwner) {
         throw new UnauthorizedException('Not allowed to edit conversation')
       }

       const updatedConversation = await this.prisma.conversation.update({
        where: {id: conversationId, contactId},
        data: {response: dto.content, summary: dto.summary}
       })
      
        return updatedConversation
    }
    

    async fetchUserConversation (user: string, contactId: string) {
          this.logger.log(`fetching conversation list for ${contactId}`);

          const conversation = await this.prisma.conversation.findMany({
            where: {contactId},
            orderBy: {createdAt: 'desc'}
          })
      
           if(!conversation.length) {
             throw new NotFoundException('Contact not found.')
           }
      
           return conversation
    }

    async fetchConversationById (contactId: string, conversationId: string) {
      
      this.logger.log(`fetching conversation ${conversationId}`);

      const conversation = await this.prisma.conversation.findFirst({
        where: {id: conversationId, contactId}
      })
  
       if(!conversation) {
         throw new NotFoundException('Conversation not found.')
       }
  
       return conversation
    }
    async fetchAiMemoryById(contactId: string) {
      this.logger.log(`fetching ai memory for contact: ${contactId}`);
        
      const aiMemory = await this.prisma.aiMemory.findFirst({
        where: {
          contactId,
        },
      });
    
      if (!aiMemory) {
        throw new NotFoundException('Ai memory not found.');
      }
    
      return aiMemory;
    }


    private parseMarkdownToJson<T>(markdownText: string): T | null {
      const regex = /```json\n([\s\S]+?)\n```/;
      const match = markdownText.match(regex);
      
      try {
        const jsonText = match ? match[1] : markdownText; // fallback if no ```json``` block
        return JSON.parse(jsonText);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
      }
    }
}

