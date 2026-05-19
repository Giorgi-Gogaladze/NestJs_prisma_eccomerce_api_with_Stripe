This project is a full-featured e-commerce backend built with NestJS and Prisma.
A modular API for e-commerce functionality
Supports products, categories, brands, variants, inventory logs, carts, orders, payments, reviews, favorites, and user management
Includes cloud image handling and caching for performance

what I Used:
NestJS for the server architecture
TypeScript for type-safe backend code
Prisma as the ORM for database modeling and migrations
PostgreSQL via pg and Prisma
Redis for caching/session support
Cloudinary for image upload/storage
Stripe for payment integration
JWT / Passport for authentication
class-validator / class-transformer for request validation
eslint / prettier for code quality

Key Modules:
catalog — product/category/brand management
cart_orders — cart and order workflows
payment — payment processing
inventory_logs — inventory tracking
users — user and auth management
engagements — reviews, ratings, favorites