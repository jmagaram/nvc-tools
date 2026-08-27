import { devices } from './devices.ts'
import type { Device } from './devices.ts'

type Props = {
  value: Device
  onChange: (device: Device) => void
}

/** The screen picker shared by the demos that preview a modal. */
export default function DeviceSelect({ value, onChange }: Props) {
  return (
    <label>
      Screen{' '}
      <select
        value={value.label}
        onChange={(event) =>
          onChange(
            devices.find((device) => device.label === event.target.value) ??
              value,
          )
        }
      >
        {devices.map((device) => (
          <option key={device.label} value={device.label}>
            {device.label} ({device.width}&times;{device.height})
          </option>
        ))}
      </select>
    </label>
  )
}
