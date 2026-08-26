import { demos } from './demos/index.ts'
import { useHashRoute } from './router.ts'

export default function App() {
  const route = useHashRoute()

  if (route === '') {
    return (
      <>
        <h1>Components</h1>
        <ul>
          {demos.map((demo) => (
            <li key={demo.slug}>
              <a href={`#/${demo.slug}`}>{demo.title}</a>
            </li>
          ))}
        </ul>
        <footer>
          <p>
            Feelings and needs vocabulary from the Feelings and Needs Inventory,
            © 2023 Center for Nonviolent Communication,{' '}
            <a href="https://www.cnvc.org">cnvc.org</a>.
          </p>
        </footer>
      </>
    )
  }

  const demo = demos.find((d) => d.slug === route)

  if (!demo) {
    return (
      <>
        <a href="#/">← All components</a>
        <h1>Not found</h1>
        <p>No component named “{route}”.</p>
      </>
    )
  }

  return (
    <>
      <a href="#/">← All components</a>
      <h1>{demo.title}</h1>
      <demo.Component />
    </>
  )
}
