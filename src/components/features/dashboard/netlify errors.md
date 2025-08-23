12:45:32 AM: Netlify Build                                                 
12:45:32 AM: ────────────────────────────────────────────────────────────────
12:45:32 AM: ​
12:45:32 AM: ❯ Version
12:45:32 AM:   @netlify/build 35.1.2
12:45:32 AM: ​
12:45:32 AM: ❯ Flags
12:45:32 AM:   accountId: 6682930e1b5f6817c6b4d782
12:45:32 AM:   baseRelDir: true
12:45:32 AM:   buildId: 68aa4478ffe6360008d518ce
12:45:32 AM:   deployId: 68aa4478ffe6360008d518d0
12:45:32 AM: ​
12:45:32 AM: ❯ Current directory
12:45:32 AM:   /opt/build/repo
12:45:32 AM: ​
12:45:32 AM: ❯ Config file
12:45:32 AM:   /opt/build/repo/netlify.toml
12:45:32 AM: ​
12:45:32 AM: ❯ Context
12:45:32 AM:   production
12:45:32 AM: ​
12:45:32 AM: build.command from netlify.toml                               
12:45:32 AM: ────────────────────────────────────────────────────────────────
12:45:32 AM: ​
12:45:32 AM: $ npm run build
12:45:32 AM: > starter@0.0.0 build
12:45:32 AM: > tsc && vite build
12:45:40 AM: src/components/common/shared/MobileMenu.tsx(39,39): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/admin/SubscriptionManagement.tsx(174,13): error TS2322: Type '{ id: any; email: any; full_name: any; subscription: { amount: number; cancel_at_period_end: boolean; canceled_at: number; created_at: string; currency: string; current_period_end: number; current_period_start: number; ... 13 more ...; user_id: string; }; overrides: ({ ...; } | ... 5 more ... | { ...; })[]; }[]' is not assignable to type 'UserSubscriptionData[]'.
12:45:40 AM:   Type '{ id: any; email: any; full_name: any; subscription: { amount: number | null; cancel_at_period_end: boolean | null; canceled_at: number | null; created_at: string; currency: string | null; ... 15 more ...; user_id: string | null; }; overrides: ({ ...; } | ... 5 more ... | { ...; })[]; }' is not assignable to type 'UserSubscriptionData'.
12:45:40 AM:     Types of property 'overrides' are incompatible.
12:45:40 AM:       Type '({ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; } | ... 5 more ... | { ...; })[]' is not assignable to type '{ id: string; override_type: string; original_value: string; override_value: string; reason: string; expires_at: string; is_active: boolean; created_at: string; }[]'.
12:45:40 AM:         Type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; } | ... 5 more ... | { ...; }' is not assignable to type '{ id: string; override_type: string; original_value: string; override_value: string; reason: string; expires_at: string; is_active: boolean; created_at: string; }'.
12:45:40 AM:           Type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; }' is missing the following properties from type '{ id: string; override_type: string; original_value: string; override_value: string; reason: string; expires_at: string; is_active: boolean; created_at: string; }': override_type, original_value, override_value, reason, and 2 more.
12:45:40 AM: src/components/features/admin/SubscriptionManagement.tsx(291,9): error TS2322: Type '({ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; } | ... 5 more ... | { ...; })[]' is not assignable to type '{ id: string; override_type: string; original_value: string; override_value: string; reason: string; expires_at: string; is_active: boolean; created_at: string; }[]'.
12:45:40 AM:   Type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; } | ... 5 more ... | { ...; }' is not assignable to type '{ id: string; override_type: string; original_value: string; override_value: string; reason: string; expires_at: string; is_active: boolean; created_at: string; }'.
12:45:40 AM:     Type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; }' is missing the following properties from type '{ id: string; override_type: string; original_value: string; override_value: string; reason: string; expires_at: string; is_active: boolean; created_at: string; }': override_type, original_value, override_value, reason, and 2 more.
12:45:40 AM: src/components/features/admin/SubscriptionManagement.tsx(815,58): error TS2339: Property 'plan_type' does not exist on type '{ id: string; amount: number; cancel_at_period_end: boolean; canceled_at: number; created_at: string; currency: string; current_period_end: number; current_period_start: number; custom_field_data: any; ... 11 more ...; user_id: string; }'.
12:45:40 AM: src/components/features/admin/SubscriptionManagement.tsx(819,67): error TS2339: Property 'plan_type' does not exist on type '{ id: string; amount: number; cancel_at_period_end: boolean; canceled_at: number; created_at: string; currency: string; current_period_end: number; current_period_start: number; custom_field_data: any; ... 11 more ...; user_id: string; }'.
12:45:40 AM: src/components/features/admin/SubscriptionManagement.tsx(822,62): error TS2339: Property 'plan_type' does not exist on type '{ id: string; amount: number; cancel_at_period_end: boolean; canceled_at: number; created_at: string; currency: string; current_period_end: number; current_period_start: number; custom_field_data: any; ... 11 more ...; user_id: string; }'.
12:45:40 AM: src/components/features/admin/SubscriptionManagement.tsx(850,35): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
12:45:40 AM: src/components/features/admin/SubscriptionManagement.tsx(1106,31): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
12:45:40 AM: src/components/features/admin/SubscriptionManagement.tsx(1118,31): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
12:45:40 AM: src/components/features/admin/SubscriptionManagement.tsx(1150,56): error TS2339: Property 'stripe_subscription_id' does not exist on type '{ id: string; amount: number; cancel_at_period_end: boolean; canceled_at: number; created_at: string; currency: string; current_period_end: number; current_period_start: number; custom_field_data: any; ... 11 more ...; user_id: string; }'.
12:45:40 AM: src/components/features/admin/UnifiedUserManagement.tsx(333,29): error TS2339: Property 'status' does not exist on type 'string'.
12:45:40 AM: src/components/features/admin/UserManagement.tsx(193,23): error TS2345: Argument of type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; ... 5 more ...; wishlist_cards: SelectQueryError<...>; }' is not assignable to parameter of type 'SetStateAction<UserData>'.
12:45:40 AM:   Type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; ... 5 more ...; wishlist_cards: SelectQueryError<...>; }' is missing the following properties from type 'UserData': is_admin, is_active, last_login_at, login_count
12:45:40 AM: src/components/features/auth/SignUpForm.tsx(69,33): error TS2339: Property 'originalError' does not exist on type 'AuthError'.
12:45:40 AM: src/components/features/dashboard/AccountSection.tsx(161,37): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/dashboard/AccountSection.tsx(250,30): error TS2339: Property 'current_period_end' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/dashboard/AccountSection.tsx(257,36): error TS2339: Property 'current_period_end' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/dashboard/layout/Sidebar.tsx(55,39): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/pokemon/CollectionDetail.tsx(155,11): error TS2322: Type '{ id: string; name: string; number: string; images: { small: string; large: string; }; set: { name: string; printedTotal: number; }; quantity: number; condition: string; isFirstEdition: boolean; isFoil: boolean; notes: string; collection_card_id: string; }[]' is not assignable to type 'PokemonCard[]'.
12:45:40 AM:   Type '{ id: string; name: string; number: string; images: { small: string; large: string; }; set: { name: string; printedTotal: number; }; quantity: number; condition: string; isFirstEdition: boolean; isFoil: boolean; notes: string; collection_card_id: string; }' is missing the following properties from type 'PokemonCard': supertype, legalities
12:45:40 AM: src/components/features/pokemon/SearchFilters.tsx(66,35): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/pricing/PricingCard.tsx(76,21): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/pricing/PricingCard.tsx(309,26): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/subscription/SubscriptionManagement.tsx(39,42): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/subscription/SubscriptionManagement.tsx(56,41): error TS2339: Property 'stripe_subscription_id' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/subscription/SubscriptionManagement.tsx(170,43): error TS2339: Property 'current_period_end' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/subscription/SubscriptionPage.tsx(39,19): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/subscription/SubscriptionPage.tsx(77,30): error TS2339: Property 'current_period_end' does not exist on type 'Subscription'.
12:45:40 AM: src/components/features/subscription/SubscriptionPage.tsx(81,34): error TS2339: Property 'current_period_end' does not exist on type 'Subscription'.
12:45:40 AM: src/hooks/useAdminStats.ts(45,9): error TS2589: Type instantiation is excessively deep and possibly infinite.
12:45:40 AM: src/hooks/useAdminStats.ts(68,17): error TS2769: No overload matches this call.
12:45:40 AM:   Overload 1 of 2, '(relation: "collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; ... 7 more ...; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, { ...; } | ... 5 more ... | { ...; }, "collections" | ... 5 more ... | "wishlist_cards", [...] | ... 2 more ... | [...]>', gave the following error.
12:45:40 AM:     Argument of type '"audit_logs"' is not assignable to parameter of type '"collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"'.
12:45:40 AM:   Overload 2 of 2, '(relation: never): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; collection_id: string; condition: string; date_added: string; id: string; is_first_edition: boolean; is_foil: boolean; notes: string; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, never, never, never>', gave the following error.
12:45:40 AM:     Argument of type '"audit_logs"' is not assignable to parameter of type 'never'.
12:45:40 AM: src/hooks/useAdminStats.ts(80,23): error TS2339: Property 'created_at' does not exist on type 'SelectQueryError<"column 'is_active' does not exist on 'users'.">'.
12:45:40 AM: src/hooks/useAdminSubscription.ts(81,55): error TS2589: Type instantiation is excessively deep and possibly infinite.
12:45:40 AM: src/hooks/useAdminSubscription.ts(384,51): error TS2339: Property 'stripe_subscription_id' does not exist on type '{ amount: number; cancel_at_period_end: boolean; canceled_at: number; created_at: string; currency: string; current_period_end: number; current_period_start: number; custom_field_data: Json; ... 12 more ...; user_id: string; }'.
12:45:40 AM: src/hooks/useAdminSubscription.ts(435,17): error TS2769: No overload matches this call.
12:45:40 AM:   Overload 1 of 2, '(relation: "collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; ... 7 more ...; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, { ...; } | ... 5 more ... | { ...; }, "collections" | ... 5 more ... | "wishlist_cards", [...] | ... 2 more ... | [...]>', gave the following error.
12:45:40 AM:     Argument of type '"subscription_overrides"' is not assignable to parameter of type '"collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"'.
12:45:40 AM:   Overload 2 of 2, '(relation: never): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; collection_id: string; condition: string; date_added: string; id: string; is_first_edition: boolean; is_foil: boolean; notes: string; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, never, never, never>', gave the following error.
12:45:40 AM:     Argument of type '"subscription_overrides"' is not assignable to parameter of type 'never'.
12:45:40 AM: src/hooks/useAdminSubscription.ts(480,39): error TS2589: Type instantiation is excessively deep and possibly infinite.
12:45:40 AM: src/hooks/useAdminSubscription.ts(480,39): error TS2589: Type instantiation is excessively deep and possibly infinite.
12:45:40 AM: src/hooks/useAdminSubscription.ts(481,17): error TS2769: No overload matches this call.
12:45:40 AM:   Overload 1 of 2, '(relation: "collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; ... 7 more ...; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, { ...; } | ... 5 more ... | { ...; }, "collections" | ... 5 more ... | "wishlist_cards", [...] | ... 2 more ... | [...]>', gave the following error.
12:45:40 AM:     Argument of type '"subscription_overrides"' is not assignable to parameter of type '"collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"'.
12:45:40 AM:   Overload 2 of 2, '(relation: never): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; collection_id: string; condition: string; date_added: string; id: string; is_first_edition: boolean; is_foil: boolean; notes: string; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, never, never, never>', gave the following error.
12:45:40 AM:     Argument of type '"subscription_overrides"' is not assignable to parameter of type 'never'.
12:45:40 AM: src/hooks/useAdminSubscription.ts(507,17): error TS2769: No overload matches this call.
12:45:40 AM:   Overload 1 of 2, '(relation: "collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; ... 7 more ...; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, { ...; } | ... 5 more ... | { ...; }, "collections" | ... 5 more ... | "wishlist_cards", [...] | ... 2 more ... | [...]>', gave the following error.
12:45:40 AM:     Argument of type '"subscription_overrides"' is not assignable to parameter of type '"collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"'.
12:45:40 AM:   Overload 2 of 2, '(relation: never): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; collection_id: string; condition: string; date_added: string; id: string; is_first_edition: boolean; is_foil: boolean; notes: string; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, never, never, never>', gave the following error.
12:45:40 AM:     Argument of type '"subscription_overrides"' is not assignable to parameter of type 'never'.
12:45:40 AM: src/hooks/useAdminSubscription.ts(523,16): error TS2339: Property 'user_id' does not exist on type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; } | ... 5 more ... | { ...; }'.
12:45:40 AM:   Property 'user_id' does not exist on type '{ card_id: string; collection_id: string; condition: string; date_added: string; id: string; is_first_edition: boolean; is_foil: boolean; notes: string; quantity: number; }'.
12:45:40 AM: src/hooks/useRecentActivity.ts(42,15): error TS2769: No overload matches this call.
12:45:40 AM:   Overload 1 of 2, '(relation: "collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; ... 7 more ...; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, { ...; } | ... 5 more ... | { ...; }, "collections" | ... 5 more ... | "wishlist_cards", [...] | ... 2 more ... | [...]>', gave the following error.
12:45:40 AM:     Argument of type '"subscription_changes"' is not assignable to parameter of type '"collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"'.
12:45:40 AM:   Overload 2 of 2, '(relation: never): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; collection_id: string; condition: string; date_added: string; id: string; is_first_edition: boolean; is_foil: boolean; notes: string; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, never, never, never>', gave the following error.
12:45:40 AM:     Argument of type '"subscription_changes"' is not assignable to parameter of type 'never'.
12:45:40 AM: src/hooks/useRecentActivity.ts(62,15): error TS2769: No overload matches this call.
12:45:40 AM:   Overload 1 of 2, '(relation: "collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; ... 7 more ...; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, { ...; } | ... 5 more ... | { ...; }, "collections" | ... 5 more ... | "wishlist_cards", [...] | ... 2 more ... | [...]>', gave the following error.
12:45:40 AM:     Argument of type '"audit_logs"' is not assignable to parameter of type '"collections" | "users" | "wishlists" | "collection_cards" | "subscriptions" | "webhook_events" | "wishlist_cards"'.
12:45:40 AM:   Overload 2 of 2, '(relation: never): PostgrestQueryBuilder<{ Tables: { collection_cards: { Row: { card_id: string; collection_id: string; condition: string; date_added: string; id: string; is_first_edition: boolean; is_foil: boolean; notes: string; quantity: number; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 5 more ...; wishlists: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, never, never, never>', gave the following error.
12:45:40 AM:     Argument of type '"audit_logs"' is not assignable to parameter of type 'never'.
12:45:40 AM: src/hooks/useRecentActivity.ts(88,35): error TS2339: Property 'id' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'."> | SelectQueryError<"column 'user_id' does not exist on 'collections'."> | ... 4 more ... | SelectQueryError<...>'.
12:45:40 AM:   Property 'id' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'.">'.
12:45:40 AM: src/hooks/useRecentActivity.ts(90,54): error TS2339: Property 'old_plan' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'."> | SelectQueryError<"column 'user_id' does not exist on 'collections'."> | ... 4 more ... | SelectQueryError<...>'.
12:45:40 AM:   Property 'old_plan' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'.">'.
12:45:40 AM: src/hooks/useRecentActivity.ts(90,86): error TS2339: Property 'new_plan' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'."> | SelectQueryError<"column 'user_id' does not exist on 'collections'."> | ... 4 more ... | SelectQueryError<...>'.
12:45:40 AM:   Property 'new_plan' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'.">'.
12:45:40 AM: src/hooks/useRecentActivity.ts(91,26): error TS2339: Property 'change_date' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'."> | SelectQueryError<"column 'user_id' does not exist on 'collections'."> | ... 4 more ... | SelectQueryError<...>'.
12:45:40 AM:   Property 'change_date' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'.">'.
12:45:40 AM: src/hooks/useRecentActivity.ts(112,28): error TS2339: Property 'id' does not exist on type 'SelectQueryError<"column 'action' does not exist on 'collections'."> | SelectQueryError<"column 'action' does not exist on 'users'."> | ... 4 more ... | SelectQueryError<...>'.
12:45:40 AM:   Property 'id' does not exist on type 'SelectQueryError<"column 'action' does not exist on 'collections'.">'.
12:45:40 AM: src/hooks/useRecentActivity.ts(114,39): error TS2339: Property 'action' does not exist on type 'SelectQueryError<"column 'action' does not exist on 'collections'."> | SelectQueryError<"column 'action' does not exist on 'users'."> | ... 4 more ... | SelectQueryError<...>'.
12:45:40 AM:   Property 'action' does not exist on type 'SelectQueryError<"column 'action' does not exist on 'collections'.">'.
12:45:40 AM: src/hooks/useRecentActivity.ts(114,56): error TS2339: Property 'entity_type' does not exist on type 'SelectQueryError<"column 'action' does not exist on 'collections'."> | SelectQueryError<"column 'action' does not exist on 'users'."> | ... 4 more ... | SelectQueryError<...>'.
12:45:40 AM:   Property 'entity_type' does not exist on type 'SelectQueryError<"column 'action' does not exist on 'collections'.">'.
12:45:40 AM: src/hooks/useRecentActivity.ts(115,26): error TS2339: Property 'created_at' does not exist on type 'SelectQueryError<"column 'action' does not exist on 'collections'."> | SelectQueryError<"column 'action' does not exist on 'users'."> | ... 4 more ... | SelectQueryError<...>'.
12:45:40 AM:   Property 'created_at' does not exist on type 'SelectQueryError<"column 'action' does not exist on 'collections'.">'.
12:45:40 AM: src/hooks/useSubscription.ts(175,32): error TS2339: Property 'plan_type' does not exist on type '{ amount: number; cancel_at_period_end: boolean; canceled_at: number; created_at: string; currency: string; current_period_end: number; current_period_start: number; custom_field_data: Json; ... 12 more ...; user_id: string; }'.
12:45:40 AM: src/hooks/useSubscription.ts(179,13): error TS2322: Type '{ plan_type: any; amount: number | null; cancel_at_period_end: boolean | null; canceled_at: number | null; created_at: string; currency: string | null; current_period_end: number | null; ... 14 more ...; user_id: string | null; }' is not assignable to type 'Subscription'.
12:45:40 AM:   Types of property 'started_at' are incompatible.
12:45:40 AM:     Type 'number' is not assignable to type 'string'.
12:45:40 AM: src/hooks/useSubscription.ts(184,29): error TS2345: Argument of type '{ plan_type: any; amount: number | null; cancel_at_period_end: boolean | null; canceled_at: number | null; created_at: string; currency: string | null; current_period_end: number | null; ... 14 more ...; user_id: string | null; }' is not assignable to parameter of type 'SetStateAction<Subscription>'.
12:45:40 AM:   Type '{ plan_type: any; amount: number | null; cancel_at_period_end: boolean | null; canceled_at: number | null; created_at: string; currency: string | null; current_period_end: number | null; ... 14 more ...; user_id: string | null; }' is not assignable to type 'Subscription'.
12:45:40 AM:     Types of property 'started_at' are incompatible.
12:45:40 AM:       Type 'number' is not assignable to type 'string'.
12:45:40 AM: src/hooks/useSubscription.ts(231,27): error TS2345: Argument of type 'Subscription | { plan_type: any; amount: number; cancel_at_period_end: boolean; canceled_at: number; created_at: string; currency: string; current_period_end: number; current_period_start: number; ... 13 more ...; user_id: string; }' is not assignable to parameter of type 'SetStateAction<Subscription>'.
12:45:40 AM:   Type '{ plan_type: any; amount: number | null; cancel_at_period_end: boolean | null; canceled_at: number | null; created_at: string; currency: string | null; current_period_end: number | null; ... 14 more ...; user_id: string | null; }' is not assignable to type 'SetStateAction<Subscription>'.
12:45:40 AM:     Type '{ plan_type: any; amount: number | null; cancel_at_period_end: boolean | null; canceled_at: number | null; created_at: string; currency: string | null; current_period_end: number | null; ... 14 more ...; user_id: string | null; }' is not assignable to type 'Subscription'.
12:45:40 AM:       Types of property 'started_at' are incompatible.
12:45:40 AM:         Type 'number' is not assignable to type 'string'.
12:45:40 AM: src/hooks/useSubscriptionLimits.ts(9,45): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/hooks/useSubscriptionLimits.ts(35,29): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/hooks/useSubscriptionStats.ts(29,70): error TS2589: Type instantiation is excessively deep and possibly infinite.
12:45:40 AM: src/hooks/useUser.ts(41,14): error TS2769: No overload matches this call.
12:45:40 AM:   Overload 1 of 2, '(values: { avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
12:45:40 AM:     Argument of type '{ id: string; email: string; full_name: any; has_seen_onboarding: boolean; preferred_lang: any; }[]' is not assignable to parameter of type '{ avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }'.
12:45:40 AM:       Type '{ id: string; email: string; full_name: any; has_seen_onboarding: boolean; preferred_lang: any; }[]' is missing the following properties from type '{ avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }': id, token_identifier
12:45:40 AM:   Overload 2 of 2, '(values: { avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
12:45:40 AM:     Object literal may only specify known properties, and 'preferred_lang' does not exist in type '{ avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }'.
12:45:40 AM: src/hooks/useUserData.ts(103,20): error TS2769: No overload matches this call.
12:45:40 AM:   Overload 1 of 2, '(values: { avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
12:45:40 AM:     Argument of type '{ id: string; email: string; full_name: any; has_seen_onboarding: boolean; preferred_lang: any; }[]' is not assignable to parameter of type '{ avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }'.
12:45:40 AM:       Type '{ id: string; email: string; full_name: any; has_seen_onboarding: boolean; preferred_lang: any; }[]' is missing the following properties from type '{ avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }': id, token_identifier
12:45:40 AM:   Overload 2 of 2, '(values: { avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
12:45:40 AM:     Property 'token_identifier' is missing in type '{ id: string; email: string; full_name: any; has_seen_onboarding: boolean; preferred_lang: any; }' but required in type '{ avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }'.
12:45:40 AM: src/hooks/useUserData.ts(130,27): error TS2345: Argument of type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; }' is not assignable to parameter of type 'SetStateAction<UserData>'.
12:45:40 AM:   Property 'preferred_lang' is missing in type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; }' but required in type 'UserData'.
12:45:40 AM: src/hooks/useUserData.ts(153,23): error TS2345: Argument of type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; }' is not assignable to parameter of type 'SetStateAction<UserData>'.
12:45:40 AM:   Property 'preferred_lang' is missing in type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; }' but required in type 'UserData'.
12:45:40 AM: src/hooks/useUserData.ts(219,23): error TS2345: Argument of type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; }' is not assignable to parameter of type 'SetStateAction<UserData>'.
12:45:40 AM:   Property 'preferred_lang' is missing in type '{ avatar_url: string; created_at: string; credits: string; email: string; full_name: string; has_seen_onboarding: boolean; id: string; image: string; name: string; subscription: string; token_identifier: string; updated_at: string; user_id: string; }' but required in type 'UserData'.
12:45:40 AM: src/lib/api.ts(227,20): error TS2339: Property 'set' does not exist on type 'PokemonCardSearchParams'.
12:45:40 AM: src/lib/api.ts(227,34): error TS2339: Property 'set' does not exist on type 'PokemonCardSearchParams'.
12:45:40 AM: src/lib/api.ts(228,46): error TS2339: Property 'set' does not exist on type 'PokemonCardSearchParams'.
12:45:40 AM: src/lib/api.ts(233,20): error TS2339: Property 'rarity' does not exist on type 'PokemonCardSearchParams'.
12:45:40 AM: src/lib/api.ts(233,37): error TS2339: Property 'rarity' does not exist on type 'PokemonCardSearchParams'.
12:45:40 AM: src/lib/api.ts(234,50): error TS2339: Property 'rarity' does not exist on type 'PokemonCardSearchParams'.
12:45:40 AM: src/lib/api.ts(283,65): error TS2552: Cannot find name 'PokemonCardSet'. Did you mean 'PokemonCard'?
12:45:40 AM: src/lib/api.ts(285,39): error TS2552: Cannot find name 'PokemonCardSet'. Did you mean 'PokemonCard'?
12:45:40 AM: src/lib/api.ts(294,45): error TS2552: Cannot find name 'PokemonCardSet'. Did you mean 'PokemonCard'?
12:45:40 AM: src/lib/api.ts(336,9): error TS2552: Cannot find name 'PokemonCardSet'. Did you mean 'PokemonCard'?
12:45:40 AM: src/lib/api.ts(342,11): error TS2552: Cannot find name 'PokemonCardSet'. Did you mean 'PokemonCard'?
12:45:40 AM: src/lib/api.ts(398,5): error TS2740: Type '{ name: string; printedTotal: number; }' is missing the following properties from type 'PokemonSet': id, series, total, legalities, and 3 more.
12:45:40 AM: src/lib/api.ts(459,11): error TS2740: Type '{ name: string; printedTotal: number; }' is missing the following properties from type 'PokemonSet': id, series, total, legalities, and 3 more.
12:45:40 AM: src/lib/apiHelpers.ts(26,7): error TS2353: Object literal may only specify known properties, and 'fromCache' does not exist in type 'PokemonCardSearchResponse'.
12:45:40 AM: src/lib/apiHelpers.ts(40,9): error TS2353: Object literal may only specify known properties, and 'fromCache' does not exist in type 'PokemonCardSearchResponse'.
12:45:40 AM: src/lib/apiHelpers.ts(54,7): error TS2353: Object literal may only specify known properties, and 'fromCache' does not exist in type 'PokemonCardSearchResponse'.
12:45:40 AM: src/lib/mockData.ts(9,3): error TS2741: Property 'legalities' is missing in type '{ id: string; name: string; supertype: string; subtypes: string[]; hp: string; types: string[]; attacks: { name: string; cost: string[]; convertedEnergyCost: number; damage: string; text: string; }[]; weaknesses: { ...; }[]; ... 9 more ...; cardmarket: { ...; }; }' but required in type 'PokemonCard'.
12:45:40 AM: src/lib/mockData.ts(92,3): error TS2741: Property 'legalities' is missing in type '{ id: string; name: string; supertype: string; subtypes: string[]; hp: string; types: string[]; attacks: { name: string; cost: string[]; convertedEnergyCost: number; damage: string; text: string; }[]; weaknesses: { ...; }[]; ... 8 more ...; tcgplayer: { ...; }; }' but required in type 'PokemonCard'.
12:45:40 AM: src/lib/mockData.ts(155,3): error TS2741: Property 'legalities' is missing in type '{ id: string; name: string; supertype: string; subtypes: string[]; hp: string; types: string[]; attacks: { name: string; cost: string[]; convertedEnergyCost: number; damage: string; text: string; }[]; weaknesses: { ...; }[]; ... 8 more ...; tcgplayer: { ...; }; }' but required in type 'PokemonCard'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(166,71): error TS2339: Property 'card_id' does not exist on type 'SelectQueryError<"column 'created_at' does not exist on 'collection_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(178,36): error TS2339: Property 'id' does not exist on type 'SelectQueryError<"column 'created_at' does not exist on 'collection_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(180,42): error TS2339: Property 'quantity' does not exist on type 'SelectQueryError<"column 'created_at' does not exist on 'collection_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(181,43): error TS2339: Property 'condition' does not exist on type 'SelectQueryError<"column 'created_at' does not exist on 'collection_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(182,41): error TS2339: Property 'is_foil' does not exist on type 'SelectQueryError<"column 'created_at' does not exist on 'collection_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(183,50): error TS2339: Property 'is_first_edition' does not exist on type 'SelectQueryError<"column 'created_at' does not exist on 'collection_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(184,39): error TS2339: Property 'notes' does not exist on type 'SelectQueryError<"column 'created_at' does not exist on 'collection_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(185,44): error TS2339: Property 'created_at' does not exist on type 'SelectQueryError<"column 'created_at' does not exist on 'collection_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(189,67): error TS2339: Property 'card_id' does not exist on type 'SelectQueryError<"column 'created_at' does not exist on 'collection_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(264,71): error TS2769: No overload matches this call.
12:45:40 AM:   Overload 1 of 2, '(values: { avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
12:45:40 AM:     Argument of type '{ id: string; email: string; full_name: any; has_seen_onboarding: boolean; preferred_lang: any; }[]' is not assignable to parameter of type '{ avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }'.
12:45:40 AM:       Type '{ id: string; email: string; full_name: any; has_seen_onboarding: boolean; preferred_lang: any; }[]' is missing the following properties from type '{ avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }': id, token_identifier
12:45:40 AM:   Overload 2 of 2, '(values: { avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
12:45:40 AM:     Object literal may only specify known properties, and 'preferred_lang' does not exist in type '{ avatar_url?: string; created_at?: string; credits?: string; email?: string; full_name?: string; has_seen_onboarding?: boolean; id: string; image?: string; name?: string; subscription?: string; token_identifier: string; updated_at?: string; user_id?: string; }'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(325,40): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(387,64): error TS2589: Type instantiation is excessively deep and possibly infinite.
12:45:40 AM: src/pages/PokemonDashboard.tsx(501,56): error TS2339: Property 'card_id' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(505,33): error TS2339: Property 'id' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(506,32): error TS2339: Property 'date_added' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(510,55): error TS2339: Property 'card_id' does not exist on type 'SelectQueryError<"column 'user_id' does not exist on 'wishlist_cards'.">'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(918,36): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(930,50): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(1232,37): error TS2339: Property 'created_at' does not exist on type '{ card_id: string; collection_id: string; condition: string; date_added: string; id: string; is_first_edition: boolean; is_foil: boolean; notes: string; quantity: number; }'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(1233,37): error TS2339: Property 'updated_at' does not exist on type '{ card_id: string; collection_id: string; condition: string; date_added: string; id: string; is_first_edition: boolean; is_foil: boolean; notes: string; quantity: number; }'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(1238,22): error TS2345: Argument of type '(prevCollections: Collection[]) => (Collection | { cards: (CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; ... 31 more ...; cardmarket?: { ...; }; } | { ...; })[]; ... 6 more ...; updated_at: string; })[]' is not assignable to parameter of type 'SetStateAction<Collection[]>'.
12:45:40 AM:   Type '(prevCollections: Collection[]) => (Collection | { cards: (CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; ... 31 more ...; cardmarket?: { ...; }; } | { ...; })[]; ... 6 more ...; updated_at: string; })[]' is not assignable to type '(prevState: Collection[]) => Collection[]'.
12:45:40 AM:     Type '(Collection | { cards: (CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; is_first_edition: boolean; ... 29 more ...; cardmarket?: { ...; }; } | { ...; })[]; ... 6 more ...; updated_at: string; })[]' is not assignable to type 'Collection[]'.
12:45:40 AM:       Type 'Collection | { cards: (CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; is_first_edition: boolean; ... 29 more ...; cardmarket?: { ...; }; } | { ...; })[]; ... 6 more ...; updated_at: string; }' is not assignable to type 'Collection'.
12:45:40 AM:         Type '{ cards: (CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; is_first_edition: boolean; notes: string; created_at: any; ... 27 more ...; cardmarket?: { url: string; updatedAt: string; prices: { averageSellPrice?: number; lowPrice?: number; trendPrice?: number...' is not assignable to type 'Collection'.
12:45:40 AM:           Types of property 'cards' are incompatible.
12:45:40 AM:             Type '(CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; is_first_edition: boolean; notes: string; created_at: any; updated_at: any; ... 26 more ...; cardmarket?: { ...; }; } | { ...; })[]' is not assignable to type 'CollectionCard[]'.
12:45:40 AM:               Type 'CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; is_first_edition: boolean; notes: string; created_at: any; updated_at: any; ... 26 more ...; cardmarket?: { ...; }; } | { ...; }' is not assignable to type 'CollectionCard'.
12:45:40 AM:                 Property 'card_id' is missing in type '{ id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; is_first_edition: boolean; notes: string; created_at: any; updated_at: any; name: string; supertype: string; ... 24 more ...; cardmarket?: { url: string; updatedAt: string; prices: { averageSellPrice?: number; lowPrice?: numb...' but required in type 'CollectionCard'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(1253,31): error TS2345: Argument of type '(prev: Collection) => Collection | { cards: (CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; ... 30 more ...; cardmarket?: { ...; }; } | { ...; })[]; ... 6 more ...; updated_at: string; }' is not assignable to parameter of type 'SetStateAction<Collection>'.
12:45:40 AM:   Type '(prev: Collection) => Collection | { cards: (CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; ... 30 more ...; cardmarket?: { ...; }; } | { ...; })[]; ... 6 more ...; updated_at: string; }' is not assignable to type '(prevState: Collection) => Collection'.
12:45:40 AM:     Type 'Collection | { cards: (CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; is_first_edition: boolean; ... 29 more ...; cardmarket?: { ...; }; } | { ...; })[]; ... 6 more ...; updated_at: string; }' is not assignable to type 'Collection'.
12:45:40 AM:       Type '{ cards: (CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; is_first_edition: boolean; notes: string; created_at: any; ... 27 more ...; cardmarket?: { url: string; updatedAt: string; prices: { averageSellPrice?: number; lowPrice?: number; trendPrice?: number...' is not assignable to type 'Collection'.
12:45:40 AM:         Types of property 'cards' are incompatible.
12:45:40 AM:           Type '(CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; is_first_edition: boolean; notes: string; created_at: any; updated_at: any; ... 26 more ...; cardmarket?: { ...; }; } | { ...; })[]' is not assignable to type 'CollectionCard[]'.
12:45:40 AM:             Type 'CollectionCard | { id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; is_first_edition: boolean; notes: string; created_at: any; updated_at: any; ... 26 more ...; cardmarket?: { ...; }; } | { ...; }' is not assignable to type 'CollectionCard'.
12:45:40 AM:               Property 'card_id' is missing in type '{ id: string; collection_id: string; quantity: number; condition: string; is_foil: boolean; is_first_edition: boolean; notes: string; created_at: any; updated_at: any; name: string; supertype: string; ... 24 more ...; cardmarket?: { url: string; updatedAt: string; prices: { averageSellPrice?: number; lowPrice?: numb...' but required in type 'CollectionCard'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(1668,35): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(1760,38): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/pages/PokemonDashboard.tsx(1769,36): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/pages/checkout-success.tsx(134,34): error TS2339: Property 'plan_type' does not exist on type 'Subscription | { plan_type: any; amount: number; cancel_at_period_end: boolean; canceled_at: number; created_at: string; currency: string; current_period_end: number; current_period_start: number; ... 13 more ...; user_id: string; }'.
12:45:40 AM:   Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/pages/checkout-success.tsx(136,33): error TS2339: Property 'plan_type' does not exist on type 'Subscription | { plan_type: any; amount: number; cancel_at_period_end: boolean; canceled_at: number; created_at: string; currency: string; current_period_end: number; current_period_start: number; ... 13 more ...; user_id: string; }'.
12:45:40 AM:   Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: src/pages/checkout-success.tsx(252,30): error TS2339: Property 'current_period_end' does not exist on type 'Subscription'.
12:45:40 AM: src/pages/checkout-success.tsx(256,34): error TS2339: Property 'current_period_end' does not exist on type 'Subscription'.
12:45:40 AM: src/pages/checkout-success.tsx(260,31): error TS2339: Property 'stripe_subscription_id' does not exist on type 'Subscription'.
12:45:40 AM: src/pages/pricing.tsx(32,41): error TS2339: Property 'plan_type' does not exist on type 'Subscription'.
12:45:40 AM: ​
12:45:40 AM: "build.command" failed                                        
12:45:40 AM: ────────────────────────────────────────────────────────────────
12:45:40 AM: ​
12:45:40 AM:   Error message
12:45:40 AM:   Command failed with exit code 2: npm run build (https://ntl.fyi/exit-code-2)
12:45:40 AM: ​
12:45:40 AM:   Error location
12:45:40 AM:   In build.command from netlify.toml:
12:45:40 AM:   npm run build
12:45:40 AM: ​
12:45:40 AM:   Resolved config
12:45:40 AM:   build:
12:45:40 AM:     command: npm run build
12:45:40 AM:     commandOrigin: config
12:45:40 AM:     environment:
12:45:40 AM:       - VITE_API_BASE
12:45:40 AM:       - VITE_BACKEND_URL
12:45:40 AM:       - VITE_STRIPE_PUBLISHABLE_KEY
12:45:40 AM:       - VITE_SUPABASE_ANON_KEY
12:45:40 AM:       - VITE_SUPABASE_URL
12:45:40 AM:       - NODE_VERSION
12:45:40 AM:     publish: /opt/build/repo/dist
12:45:40 AM:     publishOrigin: config
12:45:40 AM:   headers:
12:45:41 AM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)
12:45:41 AM:     - for: /*
      values:
        Content-Security-Policy: "default-src 'self'; script-src 'self' 'unsafe-inline'
          'unsafe-eval' https://www.googletagmanager.com; style-src 'self'
          'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;
          connect-src 'self' ****
          https://*.supabase.co wss://kiphglgoanmibjztwhmj.supabase.co
          wss://*.supabase.co ****
          https://www.google-analytics.com https://*.google-analytics.com
          https://analytics.google.com;"
        Referrer-Policy: origin-when-cross-origin
        X-Content-Type-Options: nosniff
        X-Frame-Options: DENY
        X-XSS-Protection: 1; mode=block
    - for: /assets/*
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /sw.js
      values:
        Cache-Control: no-cache
  headersOrigin: config
  redirects:
    - from: /*
      status: 200
      to: /index.html
  redirectsOrigin: config
12:45:41 AM: Build failed due to a user error: Build script returned non-zero exit code: 2
12:45:41 AM: Failing build: Failed to build site
12:45:41 AM: Finished processing build request in 27.095s