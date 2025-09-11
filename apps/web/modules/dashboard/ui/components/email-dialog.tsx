"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { toast } from "sonner";
import { useEffect } from "react";

const emailSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  recipientEmail: string;
  recipientName?: string;
}

export const EmailDialog = ({
  open,
  onOpenChange,
  conversationId,
  recipientEmail,
  recipientName,
}: EmailDialogProps) => {
  const [isSending, setIsSending] = useState(false);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsSending(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          subject: data.subject,
          message: data.message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast.success("Email sent successfully!");
      handleCancel();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset({
      subject: "",
      message: "",
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Send an email directly to{" "}
            {recipientName ? `${recipientName}` : "the contact"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>To</Label>
              <Input
                disabled={true}
                className="bg-muted"
                value={`${recipientName} <${recipientEmail}>`}
                readOnly
              />
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSending}
                      placeholder="Enter email subject"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isSending}
                      placeholder="Enter your message..."
                      rows={6}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                disabled={isSending}
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? "Sending..." : "Send Email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
