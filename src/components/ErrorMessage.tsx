import React from "react";
import { Alert } from "@/components/ui/alert";

type ErrorMessageProps = {
  message: string;
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="my-2">
      {message}
    </Alert>
  );
};

export default ErrorMessage; 