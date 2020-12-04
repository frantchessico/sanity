import React from 'react'
import FocusLock from 'react-focus-lock'

import {Box, Button, Layer, Popover, TextInput, useClickOutside, useForwardedRef} from '@sanity/ui'
import {DatePicker} from './DatePicker'

type ParseResult = {type: 'success'; date: Date} | {type: 'error'; error: Error}

function tryParse(dateAsString: string, parseFn: (dateStr: string) => Date): ParseResult {
  try {
    return {type: 'success', date: parseFn(dateAsString)}
  } catch (error) {
    return {type: 'error', error}
  }
}

type Props = {
  value?: Date
  format: (date: Date) => string
  parse: (dateString: string) => Date
  id?: string
  readOnly: boolean | null
  selectTime?: boolean
  customValidity?: string
  onParseError?: (err: null | Error) => void
  placeholder?: string
  onChange: (date?: Date) => void
  onFocus?: () => void
}

const DateInput = React.forwardRef(function DateInput(
  props: Props,
  forwardedRef: React.ForwardedRef<HTMLInputElement>
) {
  const {value, readOnly, onChange, id, format, parse} = props

  const [popoverRef, setPopoverRef] = React.useState<HTMLElement | null>(null)

  const [inputValue, setInputValue] = React.useState<string | null>(null)

  const handleDatePickerChange = (nextDate) => {
    setInputValue(null)
    onChange(nextDate)
  }
  const handleInputBlur = () => {
    if (inputValue === null) {
      return
    }
    const result = tryParse(inputValue, parse)
    if (result.type === 'success') {
      setInputValue(null)
      onChange(result.date)
      props.onParseError(null)
    } else {
      props.onParseError(result.error)
    }
  }

  const inputRef = useForwardedRef(forwardedRef)
  const buttonRef = React.useRef(null)

  const [isPickerOpen, setPickerOpen] = React.useState(false)

  useClickOutside(() => setPickerOpen(false), [popoverRef])

  const placeholder = props.placeholder || `e.g. ${format(new Date())}`

  return (
    <TextInput
      ref={inputRef}
      id={id || ''}
      readOnly={Boolean(readOnly)}
      placeholder={placeholder}
      value={inputValue === null ? (value && format(value)) || '' : inputValue}
      onChange={(event) => {
        props.onParseError(null)
        setInputValue(event.currentTarget.value)
      }}
      customValidity={props.customValidity}
      onBlur={handleInputBlur}
      onFocus={props.onFocus}
      suffix={
        <Layer>
          <Popover
            ref={setPopoverRef}
            content={
              <FocusLock
                onDeactivation={() => {
                  inputRef.current?.focus()
                  inputRef.current?.select()
                }}
              >
                <DatePicker
                  selectTime={props.selectTime}
                  onKeyUp={(e) => {
                    if (e.key === 'Escape') {
                      setPickerOpen(false)
                    }
                  }}
                  value={value}
                  onChange={handleDatePickerChange}
                />
              </FocusLock>
            }
            padding={4}
            placement="bottom"
            open={isPickerOpen}
          >
            <Box padding={2} paddingX={4}>
              <Button
                ref={buttonRef}
                icon="calendar"
                mode="bleed"
                padding={1}
                onClick={() => setPickerOpen(true)}
              />
            </Box>
          </Popover>
        </Layer>
      }
    />
  )
})

export default DateInput