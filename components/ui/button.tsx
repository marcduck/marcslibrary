'use client'
import { ark } from '@ark-ui/react/factory'
import { forwardRef } from 'react'
import { styled } from 'styled-system/jsx'
import { button } from 'styled-system/recipes'

const StyledButton = styled(ark.button, button)
export type ButtonProps = React.ComponentProps<typeof StyledButton>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  return <StyledButton type="button" ref={ref} {...props} />
})
