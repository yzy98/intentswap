import { builder } from "./builder";

import "./models/intent";
import "./models/intent-event";
import "./queries/intent";
import "./queries/intent-event";

export const schema = builder.toSchema({});
