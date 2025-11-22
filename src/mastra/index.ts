
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { assistantAgent } from './agents/assistantAgent';
import { translateAgent } from './agents/translateAgent';
import { xAiAgent } from './agents/xAiAgent';
import { chuuniAgent } from './agents/chuuniAgent';
import { trumpAgent } from './agents/trumpAgent';
import { netSlangAgent } from './agents/netSlangAgent';
import { translateWorkflow } from './workflows/translateWorkflow';
import { chuuniWorkflow } from './workflows/chuuniWorkflow';

export const mastra = new Mastra({
  agents: { assistantAgent, translateAgent, xAiAgent, chuuniAgent, trumpAgent, netSlangAgent },
  workflows: { translateWorkflow, chuuniWorkflow },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false,
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true },
  },
});
