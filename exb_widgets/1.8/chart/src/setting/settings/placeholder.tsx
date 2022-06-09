/** @jsx jsx */
import { React, css, jsx } from 'jimu-core'
import { ClickOutlined } from 'jimu-icons/outlined/application/click'
import { useTheme } from 'jimu-theme'
import { hooks } from 'jimu-ui'

const useStyle = () => {
  const dark = useTheme()?.colors?.palette?.dark

  const dark200 = dark?.[200]
  const dark500 = dark?.[500]
  return React.useMemo(() => {
    return css`
      overflow: hidden;
      height: calc(100% - 102px);
      .jimu-icon {
        color: ${dark200};
      }
      p {
        color: ${dark500};
      }
    `
  }, [dark200, dark500])
}

export const Placeholder = (): React.ReactElement => {
  const translate = hooks.useTranslate()
  const style = useStyle()
  return (
    <div css={style}
      className='select-data-placeholder d-flex flex-column align-items-center justify-content-center p-3'>
      <div className='d-flex flex-column align-items-center'>
        <ClickOutlined size={48} />
        <p className='mt-3 text-center'>
          {translate('selectDataPlaceholder')}
        </p>
      </div>
    </div>
  )
}
