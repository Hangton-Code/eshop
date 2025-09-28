"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { deleteAllChats } from "@/actions/chat";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { generateToken, isAvailable } = useRecaptcha();

  const handleDeleteAllChats = async () => {
    setIsDeleting(true);
    try {
      // Generate reCAPTCHA token for data deletion
      let recaptchaToken = "";
      if (isAvailable) {
        recaptchaToken = await generateToken("delete_all_chats");
      }

      const result = await deleteAllChats(recaptchaToken);

      if (result.success) {
        toast.success(
          `All chat records have been deleted successfully (${result.deletedChats} chats, ${result.deletedMessages} messages)`
        );
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to delete chat records");
      }
    } catch (error) {
      console.error("Error deleting chats:", error);
      toast.error("Failed to delete chat records");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your account settings and data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Data Control Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Data Control</h3>
              <Separator className="mb-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium">Delete All Chat Records</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently remove all your chat history
                      </p>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Delete All Chat Records?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete all your chat records and conversations.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAllChats}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete All"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
