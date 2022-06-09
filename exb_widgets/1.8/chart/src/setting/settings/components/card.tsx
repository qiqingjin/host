/** @jsx jsx */
import { React, jsx, css, classNames, SerializedStyles } from 'jimu-core'
import { useTheme } from 'jimu-theme'
import { Icon } from 'jimu-ui'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  icon: any
  active?: boolean
}

const useStyle = (): SerializedStyles => {
  const theme = useTheme()
  const white = theme?.colors?.white
  const primary = theme?.colors?.primary

  return React.useMemo(() => {
    return css`
      .wrapper {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border: 1px solid transparent;
        background-color: ${white};
        &.active {
          border: 2px solid ${primary};
        }
      }
    `
  }, [primary, white])
}

export const Card = (props: CardProps): React.ReactElement => {
  const { label, icon, active, onClick, ...others } = props

  const style = useStyle()
  return (
    <div css={style} onClick={onClick} {...others} title={label}>
      <Icon className={classNames('wrapper', { active })} icon={icon} />
    </div>
  )
}
