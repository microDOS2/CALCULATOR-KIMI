import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Clock, RotateCcw, X } from "lucide-react";

interface RecoveryDialogProps {
  open: boolean;
  onRecover: () => void;
  onDismiss: () => void;
}

export function RecoveryDialog({ open, onRecover, onDismiss }: RecoveryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onDismiss(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recover Unsaved Work?
          </DialogTitle>
          <DialogDescription>
            An auto-saved session was found from your previous visit. Would you like to restore it, or start fresh?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onDismiss} className="gap-1">
            <X className="h-4 w-4" /> Start Fresh
          </Button>
          <Button onClick={onRecover} className="gap-1">
            <RotateCcw className="h-4 w-4" /> Restore Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
