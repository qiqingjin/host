/** @jsx jsx */
import { React, css, jsx, classNames, SerializedStyles } from 'jimu-core'
import { SettingOutlined } from 'jimu-icons/outlined/application/setting'
import { useTheme } from 'jimu-theme'
import { Button } from 'jimu-ui'

export interface NavigationProps {
  title: string
  active?: boolean
  onClick: () => void
  className?: string
}

const useStyle = (): SerializedStyles => {
  const theme = useTheme()
  const dark400 = theme?.colors?.palette?.dark?.[400]

  return React.useMemo(() => {
    return css`
      .title {
        color: ${dark400};
      }
    `
  }, [dark400])
}

export const Navigation = React.forwardRef((props: NavigationProps, ref: React.RefObject<HTMLDivElement>): React.ReactElement => {
  const { title, active, onClick, className } = props
  const style = useStyle()

  return (
    <div
      ref={ref}
      css={style}
      className={classNames(
        className,
        'navigation w-100 d-flex align-items-center justify-content-between'
      )}
    >
      <span className='title'>{title}</span>
      <Button size='sm' type='tertiary' active={active} icon onClick={onClick}>
        <SettingOutlined />
      </Button>
    </div>
  )
})
