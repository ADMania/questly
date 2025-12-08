CREATE TABLE `actions_to_categories` (
	`action_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	FOREIGN KEY (`action_id`) REFERENCES `quest_action`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `card` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`quest_text` text NOT NULL,
	`difficulty` text DEFAULT 'medium',
	`symbol_seed` text,
	`owner_id` integer,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `card_slug_unique` ON `card` (`slug`);--> statement-breakpoint
CREATE TABLE `cards_to_categories` (
	`card_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `card`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_slug_unique` ON `category` (`slug`);--> statement-breakpoint
CREATE TABLE `comment` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	`author_id` integer NOT NULL,
	`post_id` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `objects_to_categories` (
	`object_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	FOREIGN KEY (`object_id`) REFERENCES `quest_object`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `places_to_categories` (
	`place_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	FOREIGN KEY (`place_id`) REFERENCES `quest_place`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `post` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`is_public` integer DEFAULT true,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	`author_id` integer NOT NULL,
	`attached_card_id` integer,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`attached_card_id`) REFERENCES `card`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quest_action` (
	`id` integer PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`weight` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `quest_object` (
	`id` integer PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`weight` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `quest_place` (
	`id` integer PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`weight` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `quest_template` (
	`id` integer PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`weight` integer DEFAULT 1,
	`difficulty` text DEFAULT 'medium'
);
--> statement-breakpoint
CREATE TABLE `quest_templates_to_categories` (
	`template_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `quest_template`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`avatar_url` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `vote` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`post_id` integer NOT NULL,
	`value` integer DEFAULT 1,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE no action
);
