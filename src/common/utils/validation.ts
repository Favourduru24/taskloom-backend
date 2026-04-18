import { ValidationError } from "@nestjs/common";

function buildPath(parentPath: string, property: string) {
  return parentPath ? `${parentPath}.${property}` : property;
}

function normalizeConstraintMessage(message: string, path: string, property: string) {
  if (!message.includes(property)) {
    return `${path} ${message}`;
  }
  return message.replace(property, path);
}

export function formatValidationIssues(
  errors: ValidationError[],
  parentPath = '',
): string[] {
  const issues: string[] = [];

  for (const error of errors) {
    const path = buildPath(parentPath, error.property);
    const isMissing = error.value === undefined;

    if (isMissing) {
      issues.push(`Missing property: ${path}`);
    }

    if (error.constraints && !isMissing) {
      for (const message of Object.values(error.constraints)) {
        issues.push(normalizeConstraintMessage(message, path, error.property));
      }
    }

    if (error.children?.length) {
      issues.push(...formatValidationIssues(error.children, path));
    }
  }

  return issues;
}
