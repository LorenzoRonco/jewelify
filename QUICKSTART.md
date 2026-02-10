## Installation & Running

### Step 1: Install Dependencies

**Client:**

```bash
cd client
npm install
```

**Server:**

```bash
cd server
npm install
```

### Step 2: Start the Server

```bash
cd server
node index.mjs
```

You should see:

```
Server listening at http://localhost:3001
```

### Step 3: Start the Client

In a new terminal:

```bash
cd client
npm run dev
```

You should see:

```
VITE v6.3.5  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Step 3b: Start the Client in host mode
You can host your application in your local network.

In a new terminal:

```bash
cd client
npm run dev:host
```

### Step 4: Open in Browser

Navigate to `http://localhost:5173` and you'll see the Jewelify home page!