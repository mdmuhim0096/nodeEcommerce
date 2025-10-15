import React from 'react'

const Background = () => {
  return (
    <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute inset-0'>
          <div
            className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full'
            style={{
              background: `radial-gradient(
          ellipse at top,
          rgba(16,185,129,0.3) 0%,
          rgba(10,80,60,0.2) 45%,
          rgba(0,0,0,0.1) 100%
        )`,
            }}
          />
        </div>
      </div>
  )
}

export default Background