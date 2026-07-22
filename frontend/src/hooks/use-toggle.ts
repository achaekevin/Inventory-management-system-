import { useState, useCallback } from 'react'

export function useToggle(initialState: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [state, setState] = useState(initialState)

  const toggle = useCallback(() => {
    setState((prevState) => !prevState)
  }, [])

  const setToggle = useCallback((value: boolean) => {
    setState(value)
  }, [])

  return [state, toggle, setToggle]
}
