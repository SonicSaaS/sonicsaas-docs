import nextra from 'nextra';

const withNextra = nextra({});

export default withNextra({
  // Use 'export' for static deployment, remove for dev mode
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: { unoptimized: true },
});
