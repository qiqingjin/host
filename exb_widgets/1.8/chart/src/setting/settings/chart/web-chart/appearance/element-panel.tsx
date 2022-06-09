import { React } from 'jimu-core'
import { SidePopper } from 'jimu-ui/advanced/setting-components'
import { Navigation } from '../../../components'

interface ElementPanelProps {
  label: string
  title: string
  children: React.ReactElement
}

export const ElementPanel = (props: ElementPanelProps): React.ReactElement => {
  const { label, title, children } = props

  const ref = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState<boolean>(false)

  return (
    <>
      <Navigation
        ref={ref}
        className='mt-2'
        active={active}
        title={label}
        onClick={() => setActive(!active)}
      />
      <SidePopper title={title} isOpen={active} position="right" toggle={() => setActive(false)} trigger={ref?.current}>
        {children}
      </SidePopper>
    </>
  )
}
