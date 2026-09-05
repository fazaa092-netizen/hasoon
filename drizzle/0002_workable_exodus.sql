ALTER TABLE `live_orders` ADD `otpHistory` text;--> statement-breakpoint
ALTER TABLE `live_orders` ADD `authCount` int DEFAULT 0 NOT NULL;