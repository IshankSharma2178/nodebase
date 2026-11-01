import { useAtomValue } from "jotai";
import { FlaskConicalIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { isDirtyAtom } from "../store/atoms";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const executeWorkflow = useExecuteWorkflow();
  const isDirty = useAtomValue(isDirtyAtom);

  const handleExecute = () => {
    if (isDirty) {
      toast.warning("Please save the workflow before executing it.");
      return;
    }

    executeWorkflow.mutate({ id: workflowId });
  };
  return (
    <Button
      size={"lg"}
      data-tour="editor-execute"
      onClick={handleExecute}
      disabled={executeWorkflow.isPending}
    >
      <FlaskConicalIcon className="size-4" />
      Execute workflow
    </Button>
  );
};
