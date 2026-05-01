This package reconnects the chat message route to the uploaded Supabase/Postgres schema.

What changed:
- Uses public.messages.user_id instead of sender_id
- Uses public.conversations and public.conversation_participants
- Treats conversation_id as UUID
- Resolves the authenticated actor by taking the existing app session email and mapping it to auth.users.id
- Creates the conversation plus participant row if the conversation does not already exist
- Returns the canonical UUID conversationId in the JSON response

Important assumptions:
1) The email inside your existing app session matches a row in auth.users.
2) The route is for authenticated chat, not anonymous public visitor chat.
3) Because your current widget stores non-UUID conversation ids, the client must replace its local conversation id with json.conversationId from the first successful response.
4) assistant messages are stored with the same auth user_id as the requesting user, because public.messages.user_id is NOT NULL and references auth.users.

Suggested client patch after a successful POST:
- If json.conversationId differs from local state, update local state and localStorage immediately.
- Append json.userMessage and json.assistantMessage instead of constructing local fake ids.
