import { formatRelative } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { isEmpty, set, startCase } from "lodash";
import { ChevronDownIcon, CodeIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { cn } from "../lib/utils";
import { JobReferences } from "./job-references";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Textarea } from "./ui/textarea";
import { Toggle } from "./ui/toggle";

const HighlightContext = createContext<string>("");

function FormattedLabel({
  label,
  focused,
}: {
  label: string | React.ReactNode;
  focused: boolean;
}) {
  if (typeof label !== "string") {
    return (
      <div
        className={`text-xs ${focused ? "opacity-90 font-bold" : "opacity-60"}`}
      >
        {label}
      </div>
    );
  }
  const title = startCase(label);
  return (
    <div
      className={`text-xs ${focused ? "opacity-90 font-bold" : "opacity-60"} mb-1`}
    >
      {title}
    </div>
  );
}

const identity = (v: string) => v;

const safeFormatRelative = (date: Date, baseDate: Date) => {
  try {
    return formatRelative(date, baseDate);
  } catch (e) {
    return date.toString();
  }
};

function Primitive({
  label,
  value,
  path,
  displayable,
  onChange,
  transform,
  onFocus,
}: {
  label: string;
  value: unknown;
  path: string[];
  displayable: string;
  onChange?: (path: string[], value: unknown) => void;
  transform?: (value: string) => unknown;
  onFocus: (focused: boolean) => void;
}) {
  const [state, setState] = useState(displayable);
  const [editing, setEditing] = useState(false);

  const p = path.filter(Boolean);
  const title = p[p.length - 1];

  const [mouseOver, setMouseOver] = useState(false);

  const highlightedContext = useContext(HighlightContext);

  const [highlighted, setHighlighted] = useState("");

  const displayNode = (
    <div onClick={(e) => e.stopPropagation()}>
      <Sheet open={editing} onOpenChange={(o) => setEditing(o)}>
        <div
          className="hover:underline text-left flex space-x-2 items-center"
          onMouseEnter={() => {
            onFocus(true);
            setMouseOver(true);
          }}
          onMouseLeave={() => {
            onFocus(false);
            setMouseOver(false);
          }}
        >
          <p
            className={cn(
              highlightedContext && displayable.includes(highlightedContext)
                ? "text-yellow-900 font-bold"
                : "",
              highlightedContext === displayable ? "bg-yellow-500" : "",
              "cursor-pointer",
            )}
            onClick={() => {
              setHighlighted(displayable);
              setEditing(true);
            }}
          >
            {displayable}
          </p>
        </div>
        <SheetContent style={{ minWidth: 800 }} className="overflow-scroll">
          <SheetHeader>
            <SheetTitle>
              {onChange ? "Editing" : ""} {startCase(title)}
            </SheetTitle>
            <SheetDescription>{p.join(" > ")}</SheetDescription>
          </SheetHeader>
          <div className="my-4 text-sm">
            <Textarea
              rows={3}
              value={state}
              onChange={(e) => {
                if (onChange) {
                  setState(e.target.value);
                }
              }}
              className="mb-4"
            />
            <div className="flex flex-row space-x-2">
              {onChange && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const t = transform ?? identity;
                    const v = t(state);
                    onChange(path, v);
                    setEditing(false);
                  }}
                >
                  Save
                </Button>
              )}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  navigator.clipboard.writeText(state);
                }}
              >
                Copy
              </Button>
            </div>
            <div className="h-8" />
            <JobReferences
              displayable={displayable}
              highlighted={highlighted}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <div className="p-2">
      <FormattedLabel focused={false} label={label} />
      {label === "" ? (
        <div className="text-left p-2">{displayNode}</div>
      ) : (
        <div
          className={`border-gray-300 ${mouseOver ? `text-gray-800 bg-gray-200` : `text-gray-700`}`}
        >
          {displayNode}
        </div>
      )}
    </div>
  );
}

const RenderWrapper = ({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) => {
  const emptyWrapper = (children as any).type?.name === undefined;

  return (
    <div
      className={`${emptyWrapper ? "" : ""} bl-1 ${focused ? "bg-gray-200" : ""} transition-colors duration-500`}
    >
      {children}
    </div>
  );
};

RenderWrapper.displayName = "RenderWrapper";

export function Render({
  label,
  value,
  path,
  onChange,
  highlighted,
  onFocus,
}: {
  label: string;
  value: unknown;
  path: string[];
  onChange?: (path: string[], value: unknown) => void;
  highlighted?: string[];
  onFocus: (focused: boolean) => void;
}) {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    onFocus(focused);
  }, [focused, onFocus]);

  if (value === null) {
    return (
      <RenderWrapper focused={focused}>
        <Primitive
          label={label}
          value={value}
          path={path.concat(label)}
          displayable={"null"}
          onChange={onChange}
          transform={(s) => s || null}
          onFocus={setFocused}
        />
      </RenderWrapper>
    );
  }

  if (value === undefined) {
    return (
      <RenderWrapper focused={focused}>
        <Primitive
          label={label}
          value={value}
          path={path.concat(label)}
          displayable={"undefined"}
          onChange={onChange}
          transform={(s) => s || undefined}
          onFocus={setFocused}
        />
      </RenderWrapper>
    );
  }

  if (value instanceof Date) {
    return (
      <RenderWrapper focused={focused}>
        <Primitive
          label={label}
          value={value}
          displayable={safeFormatRelative(value, new Date())}
          path={path.concat(label)}
          onChange={onChange}
          transform={(s) => new Date(s)}
          onFocus={setFocused}
        />
      </RenderWrapper>
    );
  }

  if (typeof value === "string") {
    return (
      <RenderWrapper focused={focused}>
        <Primitive
          label={label}
          value={value}
          path={path.concat(label)}
          displayable={value === "" ? "(empty string)" : value}
          onChange={onChange}
          onFocus={setFocused}
        />
      </RenderWrapper>
    );
  }

  if (typeof value === "number") {
    return (
      <RenderWrapper focused={focused}>
        <Primitive
          label={label}
          value={value}
          path={path.concat(label)}
          displayable={String(value)}
          onChange={onChange}
          transform={(s) => parseFloat(s)}
          onFocus={setFocused}
        />
      </RenderWrapper>
    );
  }

  if (typeof value === "boolean") {
    return (
      <RenderWrapper focused={focused}>
        <Primitive
          label={label}
          value={value}
          path={path.concat(label)}
          displayable={value ? "true" : "false"}
          onChange={onChange}
          transform={(s) => (s.toLowerCase().includes("true") ? true : false)}
          onFocus={setFocused}
        />
      </RenderWrapper>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="border-gray-300 text-gray-700 bg-gray-100 p-2">
          <FormattedLabel focused={focused} label={label} />
          <div className="text-gray-500">(empty)</div>
        </div>
      );
    }

    if (
      value.every(
        (v) =>
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean" ||
          v === null ||
          v === undefined ||
          v instanceof Date,
      )
    ) {
      return (
        <RenderWrapper focused={focused}>
          <div className="border-gray-300 text-gray-700 bg-gray-100 p-2">
            <div className="font-bold">
              <FormattedLabel focused={focused} label={label} />
            </div>
            <div className="flex flex-wrap">
              {value.map((v, i) => (
                <Primitive
                  key={i}
                  label={``}
                  value={v}
                  path={path.concat(label).concat(i.toString())}
                  displayable={
                    v === null
                      ? "null"
                      : v === undefined
                        ? "undefined"
                        : v.toString()
                  }
                  onChange={onChange}
                  onFocus={setFocused}
                />
              ))}
            </div>
          </div>
        </RenderWrapper>
      );
    }

    return (
      <RenderWrapper focused={focused}>
        <div className="border-gray-300 text-gray-700 bg-gray-100">
          <div className="p-2 pb-0 font-bold">
            <FormattedLabel focused={focused} label={label} />
          </div>
          {value.map((v, i) => (
            <div
              key={i}
              className="m-2 border border-gray-200 hover:border-gray-400"
            >
              <div className="">
                <FormattedLabel
                  focused={focused}
                  label={
                    <div className="bg-gray-300 text-center text-xs text-gray-700 w-10 h-6 p-1">
                      #{(i + 1).toString()}
                    </div>
                  }
                />
              </div>
              <Render
                key={i}
                label={``}
                value={v}
                path={path.concat(label).concat(i.toString())}
                onChange={onChange}
                highlighted={highlighted}
                onFocus={setFocused}
              />
            </div>
          ))}
        </div>
      </RenderWrapper>
    );
  }

  if (typeof value === "object") {
    if (isEmpty(value)) {
      return (
        <div className="border-gray-300 text-gray-700 bg-gray-100 p-2">
          <FormattedLabel focused={focused} label={label} />
          <div className="text-gray-500">(empty)</div>
        </div>
      );
    }

    return (
      <RenderWrapper focused={focused}>
        <div className="text-gray-700 bg-gray-100 p-2">
          {label && (
            <div className="font-bold">
              <FormattedLabel focused={focused} label={label} />
            </div>
          )}
          <div>
            {Object.entries(value).map(([k, v]) => (
              <Render
                key={k}
                label={k}
                value={v}
                path={path.concat(label)}
                onChange={onChange}
                highlighted={highlighted}
                onFocus={setFocused}
              />
            ))}
          </div>
        </div>
      </RenderWrapper>
    );
  }

  return <div>Unknown type: {typeof value}</div>;
}

export function JsonForm({
  label,
  value,
  onUpdate,
  highlighted,
}: {
  label: string;
  value: object;
  onUpdate?: (v: unknown) => void;
  highlighted?: string;
}) {
  const [showJson, setShowJson] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);

  const onChange = useCallback(
    (s: object, path: string[], changed: unknown) => {
      if (onUpdate) {
        const p = path.filter(Boolean).slice(1);
        const newState = { ...s };
        set(newState, p, changed);
        onUpdate(newState);
      } else {
        alert("No update function provided");
      }
    },
    [onUpdate],
  );

  return (
    <HighlightContext.Provider value={highlighted ?? ""}>
      <div className="overflow-hidden bg-gray-100 rounded-lg">
        <div
          className="p-2 flex justify-between border-2 border-gray-100 bg-white rounded-lg space-x-2 items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex flex-row items-center space-x-2 pl-2 cursor-pointer hover:underline transition-all duration-500"
            onClick={() => setExpanded(!expanded)}
          >
            <motion.div
              initial={false}
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </motion.div>
            <p className="text-xs font-bold mr-4 text-gray-500">Data</p>
          </div>
          <div>
            <Toggle
              aria-label="Show Raw JSON"
              size="sm"
              onPressedChange={(e) => setShowJson(e)}
              pressed={showJson}
            >
              <CodeIcon className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {showJson ? (
                <div className="bg-gray-100 text-gray-800 p-6">
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                </div>
              ) : (
                <Render
                  label={label}
                  value={value}
                  path={[]}
                  onChange={
                    onUpdate
                      ? (path: string[], changed: unknown) =>
                          onChange(value, path, changed)
                      : undefined
                  }
                  onFocus={() => {}}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </HighlightContext.Provider>
  );
}
