import adapter from "@sveltejs/adapter-vercel";

// Name the Node version outright, so Vercel's build works whatever Node it builds with.
export default { kit: { adapter: adapter({ runtime: "nodejs24.x" }) } };
