DROP TABLE `actions_to_categories`;--> statement-breakpoint
DROP TABLE `cards_to_categories`;--> statement-breakpoint
DROP TABLE `category`;--> statement-breakpoint
DROP TABLE `objects_to_categories`;--> statement-breakpoint
DROP TABLE `places_to_categories`;--> statement-breakpoint
DROP TABLE `quest_action`;--> statement-breakpoint
DROP TABLE `quest_object`;--> statement-breakpoint
DROP TABLE `quest_place`;--> statement-breakpoint
DROP TABLE `quest_templates_to_categories`;--> statement-breakpoint
ALTER TABLE `card` ADD `category` text;--> statement-breakpoint
ALTER TABLE `quest_template` ADD `category` text;