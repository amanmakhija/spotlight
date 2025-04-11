import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  method: "POST",
  path: "/clerk-webhook",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret)
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");
    if (!svix_id || !svix_signature || !svix_timestamp)
      return new Response("Error Occured -- no svix headers", { status: 400 });

    const payload = await request.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(webhookSecret);
    let event: any;

    try {
      event = wh.verify(body, {
        "svix-id": svix_id,
        "svix-signature": svix_signature,
        "svix-timestamp": svix_timestamp,
      }) as any;
    } catch (error) {
      console.error("Error verifying webhook", error);
      return new Response("Error Occured", {
        status: 400,
      });
    }

    const eventType = event.type;

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;
      const email = email_addresses[0].email_address;
      const fullname = `${first_name || ""} ${last_name || ""}`;

      try {
        await ctx.runMutation(api.users.createUser, {
          email,
          fullname,
          image: image_url,
          clerkId: id,
          username: email.split("@")[0],
        });
      } catch (error) {
        console.error("Error creating user", error);
        return new Response("Error creating user", {
          status: 500,
        });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

export default http;
