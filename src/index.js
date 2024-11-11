import React, {useState, useCallback, useRef, useEffect} from 'react'
import ReactDOM from 'react-dom'

function App() {
  const [items, setItems] = useState([]) // Stores loaded items
  const [page, setPage] = useState(1) // Tracks the current page
  const [loading, setLoading] = useState(false) // Tracks loading status
  const [hasMore, setHasMore] = useState(true) // Checks if more data is available
  const observerRef = useRef() // Reference to the observer

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`,
      )
      const data = await response.json()

      setItems((prevItems) => [...prevItems, ...data])
      setHasMore(data.length > 0) // Check if there's more data
      setPage((prevPage) => prevPage + 1) // Increment page for the next fetch
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [page])

  // Set up Intersection Observer
  const lastItemRef = useCallback(
    (node) => {
      if (loading) return // If loading, don't observe
      if (observerRef.current) observerRef.current.disconnect() // Disconnect previous observer

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchData() // Fetch more data if the last item is visible
        }
      })

      if (node) observerRef.current.observe(node) // Observe the new node
    },
    [loading, hasMore, fetchData],
  )

  // Load initial data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div>
      <h1>Infinite Scroll with Intersection Observer</h1>
      <ul>
        {items.map((item, index) => (
          <li
            key={item.id}
            ref={index === items.length - 1 ? lastItemRef : null}
          >
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ul>
      {loading && <p>Loading more items...</p>}
      {!hasMore && <p>No more items to load.</p>}
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
