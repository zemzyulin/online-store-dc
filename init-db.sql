CREATE TABLE IF NOT EXISTS "users" (
	"id" SERIAL NOT NULL,
	"email" VARCHAR(255) NOT NULL UNIQUE,
	"password" VARCHAR(255) NOT NULL,
	"first_name" VARCHAR(255) NOT NULL,
	"last_name" VARCHAR(255) NOT NULL,
	"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
	CONSTRAINT "user_pk" PRIMARY KEY ("id")
);



CREATE TABLE IF NOT EXISTS "cart" (
	"id" SERIAL NOT NULL,
	"user_id" INTEGER NOT NULL,
	"session" VARCHAR(255) NOT NULL,
	"total" NUMERIC(12,2) NOT NULL DEFAULT 0.00,
	"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
	CONSTRAINT "cart_pk" PRIMARY KEY ("id")
);



CREATE TABLE IF NOT EXISTS "product" (
	"id" SERIAL NOT NULL,
	"name" VARCHAR(255) NOT NULL,
	"description" VARCHAR(255) NOT NULL,
	"category" VARCHAR(255) NOT NULL,
	"price" NUMERIC(12,2) NOT NULL,
	"quantity" INTEGER NOT NULL,
	"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
	CONSTRAINT "product_pk" PRIMARY KEY ("id")
);



CREATE TABLE IF NOT EXISTS "orders" (
	"id" SERIAL NOT NULL,
	"user_id" INTEGER NOT NULL,
	"status" VARCHAR(255) NOT NULL,
	"total" NUMERIC(12,2) NOT NULL,
	"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
	CONSTRAINT "orders_pk" PRIMARY KEY ("id")
);



CREATE TABLE IF NOT EXISTS "cart_item" (
	"id" SERIAL NOT NULL,
	"cart_id" INTEGER NOT NULL,
	"product_id" INTEGER NOT NULL,
	"quantity" INTEGER NOT NULL,
	"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
	CONSTRAINT "cart_item_pk" PRIMARY KEY ("id")
);



CREATE TABLE IF NOT EXISTS "order_item" (
	"id" SERIAL NOT NULL,
	"order_id" INTEGER NOT NULL,
	"product_id" INTEGER NOT NULL,
	"quantity" INTEGER NOT NULL,
	"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
	CONSTRAINT "order_item_pk" PRIMARY KEY ("id")
);




ALTER TABLE "cart" ADD CONSTRAINT "cart_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_fk0" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE;
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_fk1" FOREIGN KEY ("product_id") REFERENCES "product"("id");
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_fk0" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_fk1" FOREIGN KEY ("product_id") REFERENCES "product"("id");


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_product_updated_at
BEFORE UPDATE ON product
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cart_updated_at
BEFORE UPDATE ON cart
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cart_item_updated_at
BEFORE UPDATE ON cart_item
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_order_item_updated_at
BEFORE UPDATE ON order_item
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();




