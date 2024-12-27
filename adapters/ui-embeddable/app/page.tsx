import MicroApp from '@/components/micro-app'

const clusterId = process.env.NEXT_PUBLIC_TEST_INFERABLE_CLUSTER_ID;

if (!clusterId) {
  throw new Error("NEXT_PUBLIC_TEST_INFERABLE_CLUSTER_ID is not set");
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto p-4">
        <MicroApp initialMessage="Is the server running?" clusterId={clusterId!} customAuthToken="test" />
      </main>
    </div>
  )
}
