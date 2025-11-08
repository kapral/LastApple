# Quick Reference: React to Svelte Migration Patterns

This is a quick reference guide for developers working on the React to Svelte migration. For complete details, see MIGRATION_PLAN.md and REACT_VS_SVELTE_COMPARISON.md.

## Table of Contents
1. [State Management](#state-management)
2. [Props](#props)
3. [Lifecycle](#lifecycle)
4. [Event Handling](#event-handling)
5. [Conditional Rendering](#conditional-rendering)
6. [Lists](#lists)
7. [Stores (Context Replacement)](#stores)
8. [Computed Values](#computed-values)
9. [Async Operations](#async-operations)
10. [Two-way Binding](#two-way-binding)

---

## State Management

### React
```tsx
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
```

### Svelte
```svelte
<script lang="ts">
  let count = 0;
  let user: User | null = null;
</script>
```

**Key Difference**: Just use regular variables!

---

## Props

### React
```tsx
interface Props {
  name: string;
  age: number;
  optional?: string;
}

const MyComponent: React.FC<Props> = ({ name, age, optional }) => {
  return <div>{name}</div>;
};
```

### Svelte
```svelte
<script lang="ts">
  export let name: string;
  export let age: number;
  export let optional: string | undefined = undefined;
</script>

<div>{name}</div>
```

**Key Difference**: Use `export let` for props

---

## Lifecycle

### React
```tsx
useEffect(() => {
  console.log('Component mounted');
  
  return () => {
    console.log('Component unmounting');
  };
}, []);

useEffect(() => {
  console.log('Value changed:', value);
}, [value]);
```

### Svelte
```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  onMount(() => {
    console.log('Component mounted');
  });
  
  onDestroy(() => {
    console.log('Component unmounting');
  });
  
  // Reactive statement - runs when value changes
  $: console.log('Value changed:', value);
</script>
```

**Key Difference**: Explicit lifecycle functions, reactive statements for dependencies

---

## Event Handling

### React
```tsx
const handleClick = (e: React.MouseEvent) => {
  console.log('Clicked');
};

<button onClick={handleClick}>Click</button>
<button onClick={() => console.log('Inline')}>Click</button>
```

### Svelte
```svelte
<script lang="ts">
  function handleClick(e: MouseEvent) {
    console.log('Clicked');
  }
</script>

<button on:click={handleClick}>Click</button>
<button on:click={() => console.log('Inline')}>Click</button>
```

**Key Difference**: Use `on:event` instead of `onEvent`

---

## Conditional Rendering

### React
```tsx
{isLoggedIn && <Dashboard />}

{isLoggedIn ? <Dashboard /> : <Login />}

{status === 'loading' && <Spinner />}
{status === 'error' && <Error />}
{status === 'success' && <Data />}
```

### Svelte
```svelte
{#if isLoggedIn}
  <Dashboard />
{/if}

{#if isLoggedIn}
  <Dashboard />
{:else}
  <Login />
{/if}

{#if status === 'loading'}
  <Spinner />
{:else if status === 'error'}
  <Error />
{:else if status === 'success'}
  <Data />
{/if}
```

**Key Difference**: Use `{#if}` blocks instead of `&&` or ternary

---

## Lists

### React
```tsx
{items.map(item => (
  <div key={item.id}>
    {item.name}
  </div>
))}
```

### Svelte
```svelte
{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}

<!-- Or with index -->
{#each items as item, index (item.id)}
  <div>{index}: {item.name}</div>
{/each}
```

**Key Difference**: Use `{#each}` instead of `.map()`, keys in parentheses

---

## Stores (Context Replacement)

### React Context
```tsx
// Context creation
const MyContext = React.createContext<Value | undefined>(undefined);

export const MyProvider: React.FC<{children}> = ({ children }) => {
  const [value, setValue] = useState(initialValue);
  
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
};

// Usage
const { value, setValue } = useContext(MyContext);
```

### Svelte Store
```typescript
// stores/myStore.ts
import { writable } from 'svelte/store';

export const myStore = writable(initialValue);
```

```svelte
<!-- Usage -->
<script lang="ts">
  import { myStore } from '$lib/stores/myStore';
  
  // Read value with $
  $: console.log($myStore);
  
  // Update value
  myStore.set(newValue);
  myStore.update(v => v + 1);
</script>

<div>{$myStore}</div>
```

**Key Difference**: Much simpler! No providers, use `$` to auto-subscribe

---

## Computed Values

### React
```tsx
const fullName = useMemo(
  () => `${firstName} ${lastName}`,
  [firstName, lastName]
);

const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items]
);
```

### Svelte
```svelte
<script lang="ts">
  let firstName = 'John';
  let lastName = 'Doe';
  
  // Reactive declarations - automatically computed
  $: fullName = `${firstName} ${lastName}`;
  
  $: total = items.reduce((sum, item) => sum + item.price, 0);
</script>
```

**Key Difference**: Use `$:` for reactive statements, no dependency arrays needed

---

## Async Operations

### React
```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      const json = await response.json();
      setData(json);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### Svelte
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  let dataPromise: Promise<Data>;
  
  onMount(() => {
    dataPromise = fetch('/api/data').then(r => r.json());
  });
</script>

{#await dataPromise}
  <p>Loading...</p>
{:then data}
  <p>Data: {data}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

**Key Difference**: Built-in `{#await}` blocks for async data

---

## Two-way Binding

### React
```tsx
const [text, setText] = useState('');

<input 
  value={text}
  onChange={e => setText(e.target.value)}
/>

const [checked, setChecked] = useState(false);

<input
  type="checkbox"
  checked={checked}
  onChange={e => setChecked(e.target.checked)}
/>
```

### Svelte
```svelte
<script lang="ts">
  let text = '';
  let checked = false;
</script>

<input bind:value={text} />

<input type="checkbox" bind:checked />
```

**Key Difference**: Use `bind:` for two-way binding

---

## Common Patterns in LastApple

### Pattern 1: Authentication Check Hook

#### React
```tsx
// hooks/useStartupAppleAuthenticationCheck.ts
export const useStartupAppleAuthenticationCheck = () => {
  const { checkAuthentication } = useAppleContext();
  
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);
};

// App.tsx
useStartupAppleAuthenticationCheck();
```

#### Svelte
```svelte
<!-- routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { appleStore } from '$lib/stores/apple';
  
  onMount(() => {
    appleStore.checkAuthentication();
  });
</script>
```

---

### Pattern 2: SignalR Connection Hook

#### React
```tsx
const connection = useRef<HubConnection | null>(null);

useEffect(() => {
  connection.current = new signalR.HubConnectionBuilder()
    .withUrl(`${environment.apiUrl}hubs`)
    .build();
  
  connection.current.start();
  connection.current.on('trackAdded', handler);
  
  return () => connection.current?.stop();
}, [stationId]);
```

#### Svelte
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import * as signalR from '@aspnet/signalr';
  
  export let stationId: string;
  
  let connection: HubConnection | null = null;
  
  onMount(async () => {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}hubs`)
      .build();
    
    await connection.start();
    connection.on('trackAdded', handler);
    
    return () => connection?.stop();
  });
</script>
```

---

### Pattern 3: MusicKit Event Listeners

#### React
```tsx
const handleStateChange = useCallback((event) => {
  setIsPlaying(event.state === 'playing');
}, []);

useEffect(() => {
  musicKit.addEventListener('playbackStateDidChange', handleStateChange);
  return () => {
    musicKit.removeEventListener('playbackStateDidChange', handleStateChange);
  };
}, [musicKit, handleStateChange]);
```

#### Svelte
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { musicKit } from '$lib/musickit';
  
  let isPlaying = false;
  
  function handleStateChange(event: any) {
    isPlaying = event.state === 'playing';
  }
  
  onMount(() => {
    musicKit.addEventListener('playbackStateDidChange', handleStateChange);
    
    return () => {
      musicKit.removeEventListener('playbackStateDidChange', handleStateChange);
    };
  });
</script>
```

---

### Pattern 4: Context Usage

#### React
```tsx
// AppContext.tsx
const AppContext = React.createContext<IAppContext | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('Must be used within provider');
  return context;
};

// Component
const { latestStationId, setLatestStationId } = useAppContext();
```

#### Svelte
```typescript
// stores/app.ts
import { writable } from 'svelte/store';

function createAppStore() {
  const { subscribe, set } = writable<string | undefined>(undefined);
  
  return {
    subscribe,
    setLatestStationId: set
  };
}

export const latestStationId = createAppStore();
```

```svelte
<!-- Component -->
<script lang="ts">
  import { latestStationId } from '$lib/stores/app';
</script>

<p>Latest: {$latestStationId}</p>
<button on:click={() => latestStationId.setLatestStationId('new-id')}>
  Update
</button>
```

---

## TypeScript Differences

### React
```tsx
interface Props {
  name: string;
  onSelect: (id: string) => void;
  children?: React.ReactNode;
}

const Component: React.FC<Props> = ({ name, onSelect, children }) => {
  const [state, setState] = useState<MyType | null>(null);
  
  return <div>{name}</div>;
};
```

### Svelte
```svelte
<script lang="ts">
  import type { ComponentEvents } from 'svelte';
  
  export let name: string;
  export let onSelect: (id: string) => void;
  
  let state: MyType | null = null;
</script>

<div>{name}</div>
<slot />  <!-- for children -->
```

---

## Styling

### React
```tsx
import styles from './Component.module.css';

const Component = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hello</h1>
    </div>
  );
};
```

### Svelte
```svelte
<script lang="ts">
  // Script here
</script>

<div class="container">
  <h1 class="title">Hello</h1>
</div>

<style>
  .container {
    padding: 1rem;
  }
  
  .title {
    color: blue;
  }
  
  /* Styles are scoped to this component by default! */
</style>
```

**Key Difference**: Built-in scoped styling, no CSS modules needed

---

## Common Gotchas

### 1. Reactivity
**React**: Need to call setter function
```tsx
setItems([...items, newItem]);  // ✅
items.push(newItem);            // ❌ Won't trigger re-render
```

**Svelte**: Need reassignment for arrays/objects
```svelte
items = [...items, newItem];    // ✅
items.push(newItem);            // ❌ Won't trigger reactivity
items = items;                  // ✅ Triggers reactivity after mutation
```

### 2. Event Handlers
**React**: Automatically bound
```tsx
<button onClick={handleClick}>  // ✅ Already bound
```

**Svelte**: Not automatically bound (but usually not an issue)
```svelte
<button on:click={handleClick}>  // ✅ Works fine
<button on:click={() => this.handleClick()}>  // If you need 'this'
```

### 3. Conditional Classes
**React**:
```tsx
<div className={`base ${isActive ? 'active' : ''}`}>
```

**Svelte**:
```svelte
<div class="base" class:active={isActive}>
<!-- or -->
<div class:active>  <!-- uses variable named 'active' -->
```

---

## File Organization

### React Structure
```
src/
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Player/
│       ├── StationPlayer.tsx
│       └── PlayerControls.tsx
├── hooks/
│   ├── useStationConnection.ts
│   └── useMusicKitPlayer.ts
├── contexts/
│   ├── AppContext.tsx
│   └── AppleContext.tsx
└── App.tsx
```

### Svelte Structure (Recommended)
```
src/
├── routes/
│   ├── +page.svelte           (Home)
│   ├── +layout.svelte          (Root layout)
│   ├── settings/
│   │   └── +page.svelte
│   └── station/
│       └── [id]/
│           └── +page.svelte
├── lib/
│   ├── components/
│   │   ├── Header.svelte
│   │   ├── Footer.svelte
│   │   └── player/
│   │       ├── StationPlayer.svelte
│   │       └── PlayerControls.svelte
│   ├── stores/
│   │   ├── app.ts
│   │   └── apple.ts
│   └── composables/
│       ├── signalr.ts
│       └── musickit.ts
└── app.html
```

---

## Quick Migration Checklist

For each component:

- [ ] Copy component to new `.svelte` file
- [ ] Convert `React.FC<Props>` to `export let` props
- [ ] Convert `useState` to regular `let` variables
- [ ] Convert `useEffect` to `onMount`/`onDestroy` or `$:` reactive statements
- [ ] Convert `useContext` to store imports with `$` prefix
- [ ] Convert `useCallback`/`useMemo` to `$:` reactive statements
- [ ] Convert JSX to Svelte template syntax
- [ ] Convert `className` to `class`
- [ ] Convert `onClick` to `on:click` (and other events)
- [ ] Convert `&&` conditionals to `{#if}`
- [ ] Convert `.map()` to `{#each}`
- [ ] Add `<style>` block if needed
- [ ] Test the component
- [ ] Migrate tests to Vitest

---

## Resources

- **Svelte Tutorial**: https://svelte.dev/tutorial
- **SvelteKit Docs**: https://kit.svelte.dev/docs
- **Svelte TypeScript**: https://svelte.dev/docs/typescript
- **Migration Plan**: See `MIGRATION_PLAN.md`
- **Comparison**: See `REACT_VS_SVELTE_COMPARISON.md`

---

## Getting Help

1. Check this quick reference
2. Check MIGRATION_PLAN.md for detailed patterns
3. Check REACT_VS_SVELTE_COMPARISON.md for side-by-side examples
4. Check Svelte documentation
5. Ask the team

**Remember**: Svelte is simpler! If you're writing complex code, there's probably a simpler way.
