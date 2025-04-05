# Multilingual Email Templates for PokéCollector

This directory contains multilingual email templates for the PokéCollector application. These templates use Supabase's Go templating language to conditionally display content based on the user's preferred language.

## How It Works

1. When a user registers, their preferred language is stored in the user metadata as `preferred_lang`.
2. The email templates use conditional logic to display content in the appropriate language.
3. The templates check for language preference in two places:
   - First in the `.Data.preferred_lang` field (passed directly in the request)
   - Then in the `.User.user_metadata.preferred_lang` field (from user metadata)
4. If no language preference is found in either place, English is used as the default.

## Templates Included

- `confirmation.html` - Email confirmation for new users
- `password-reset.html` - Password reset requests
- `magic-link.html` - Magic link for passwordless authentication
- `email-change.html` - Email address change confirmation

## How to Set Up in Supabase Dashboard

1. Log in to your Supabase dashboard
2. Go to Authentication > Email Templates
3. For each template type (Confirmation, Recovery, Magic Link, Email Change):
   - Click on the template
   - Replace the default template with the content from the corresponding file in this directory
   - Save the changes

## Testing

To test the templates:

1. Register a new user with a preferred language set to "es" or "en"
2. Check that the confirmation email is sent in the correct language
3. Test password reset and magic link functionality to ensure they also use the correct language

## Adding More Languages

To add support for additional languages:

1. Add the new language to the conditional logic in each template:

```html
{{ if or (eq .Data.preferred_lang "es") (eq .User.user_metadata.preferred_lang
"es") }}
<!-- Spanish content -->
{{ else if or (eq .Data.preferred_lang "fr") (eq
.User.user_metadata.preferred_lang "fr") }}
<!-- French content -->
{{ else }}
<!-- Default English content -->
{{ end }}
```

2. Update the language selection in the application to include the new language option
3. Ensure the `preferred_lang` value is correctly set during registration and when the user changes their language preference

## Troubleshooting

If emails are not being sent in the correct language:

1. Check that the user's `preferred_lang` is correctly set in their metadata
2. Verify that the templates are correctly installed in the Supabase dashboard
3. Check the Supabase logs for any errors related to email sending

## Resources

- [Supabase Documentation on Customizing Emails by Language](https://supabase.com/docs/guides/troubleshooting/customizing-emails-by-language-KZ_38Q)
- [Go Templating Language Documentation](https://pkg.go.dev/text/template)
