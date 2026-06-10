import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { healthRouter } from "./modules/health/health.routes";
import { crmRouter } from "./modules/crm/crm.routes";
import { billingRouter } from "./modules/billing/billing.routes";
import { inventoryRouter } from "./modules/inventory/inventory.routes";
import { accountingRouter } from "./modules/accounting/accounting.routes";
import { opsRouter } from "./modules/ops/ops.routes";
import { errorMiddleware } from "./shared/middlewares/error.middleware";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.use("/api/v1", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/crm", crmRouter);
app.use("/api/v1/billing", billingRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use("/api/v1/accounting", accountingRouter);
app.use("/api/v1/ops", opsRouter);

app.use(errorMiddleware);
