import type { JSX } from "hono/jsx/jsx-runtime";

type Resolvable<T> = T | (() => T);
type Accessor<T> = () => T;
type Renderable = JSX.Element | JSX.Element[] | null;
type RenderableFactory = () => Renderable;

const resolve = <T,>(value: Resolvable<T>): T =>
  typeof value === "function" ? (value as () => T)() : value;

const resolveRenderable = (
  value?: Renderable | RenderableFactory
): Renderable => {
  if (typeof value === "function") {
    return (value as RenderableFactory)();
  }

  return value ?? null;
};

const flattenChildren = (children: Renderable | Renderable[]): Renderable[] => {
  const queue = (Array.isArray(children) ? children : [children]).filter(
    (child): child is Renderable => child !== undefined
  );
  const flattened: Renderable[] = [];

  while (queue.length) {
    const next = queue.shift();

    if (Array.isArray(next)) {
      queue.unshift(
        ...next.filter((child): child is Renderable => child !== undefined)
      );
    } else if (next !== null) {
      flattened.push(next);
    }
  }

  return flattened;
};

export interface ShowProps<T = unknown> {
  when: Resolvable<T>;
  keyed?: boolean;
  children: Renderable | ((value: T | Accessor<T>) => Renderable);
  fallback?: Renderable | RenderableFactory;
}

export function Show<T>({
  when,
  keyed = false,
  children,
  fallback,
}: ShowProps<T>): Renderable {
  const resolved = resolve(when);

  if (!resolved) {
    return resolveRenderable(fallback);
  }

  if (typeof children === "function") {
    return resolveRenderable(() =>
      (children as (value: T | Accessor<T>) => Renderable)(
        keyed ? (resolved as T) : () => resolve(when)
      )
    );
  }

  return resolveRenderable(children);
}

export interface ForProps<T> {
  each: Resolvable<readonly T[]>;
  children: (item: T, index: number) => Renderable;
  fallback?: Renderable | RenderableFactory;
}

export function For<T>({ each, children, fallback }: ForProps<T>): Renderable {
  const resolved = resolve(each);

  if (!resolved || resolved.length === 0) {
    return resolveRenderable(fallback);
  }

  return resolved.map((item, index) => children(item, index));
}

export interface MatchProps<T = unknown> {
  when: Resolvable<T>;
  keyed?: boolean;
  children: Renderable | ((value: T | Accessor<T>) => Renderable);
}

export function Match(props: MatchProps): JSX.Element {
  return { type: Match, props } as unknown as JSX.Element;
}

export interface SwitchProps {
  children: Renderable | Renderable[];
  fallback?: Renderable | RenderableFactory;
}

const isMatchElement = (
  child: unknown
): child is JSX.Element & { props: MatchProps } =>
  typeof child === "object" &&
  child !== null &&
  "type" in (child as JSX.Element);

export function Switch({ children, fallback }: SwitchProps): Renderable {
  const candidates = flattenChildren(children);

  for (const candidate of candidates) {
    if (!isMatchElement(candidate) || candidate.type !== Match) continue;

    const matchProps = candidate.props;
    const resolved = resolve(matchProps.when);

    if (!resolved) continue;

    const matchChildren = matchProps.children;

    if (typeof matchChildren === "function") {
      return resolveRenderable(() =>
        (matchChildren as (value: unknown) => Renderable)(
          matchProps.keyed ? resolved : () => resolve(matchProps.when)
        )
      );
    }

    return resolveRenderable(matchChildren);
  }

  return resolveRenderable(fallback);
}
