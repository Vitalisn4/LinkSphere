import ViewLinks from "./pages/ViewLinks"

// This is a standalone component to test Member 4's implementation
// without depending on the router or other team members' components
const ViewLinksDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="p-4">
        <ViewLinks />
      </div>
    </div>
  )
}

export default ViewLinksDemo
