import { Platforms } from '@ionic/core';
import { LimitedPeripheralData, PeripheralData } from './ble.types';

import { Pressure, PressureDevice, psiToBar } from './pressureBluetoothDevice';
import { to128bitUUID } from './common/util';

declare var ble;
export default class PopsiclePressure extends PressureDevice {
  public static PRESSURE_SERVICE_UUID = '1c47e896-4922-4030-957c-32a5be64d3ba';
  public static PRESSURE_CHAR_UUID = to128bitUUID('2A6D');

  public static ZERO_SERVICE_UUID = '1c47e896-4922-4030-957c-32a5be64d3ba';
  public static ZERO_CHAR_UUID = 'ad029632-366d-4a52-ad6b-2a52fb369d3d';

  public static test(device: LimitedPeripheralData) {
    return (
      device &&
      device.advertising &&
      device.advertising.length >= 2 &&
      device.advertising[0] === 0xea &&
      device.advertising[1] === 0xf0
    );
  }

  constructor(data: PeripheralData, platforms: Platforms[]) {
    super(data, platforms);
    this.connect();
  }

  public async connect() {
    this.updateZero();
    await this.attachNotification();
  }

  public async updateZero(): Promise<void> {
    const data = new Uint8Array(1);

    return new Promise((resolve, reject) => {
      ble.writeWithoutResponse(
        this.device_id,
        PopsiclePressure.ZERO_SERVICE_UUID,
        PopsiclePressure.ZERO_CHAR_UUID,
        data.buffer,
        resolve,
        reject
      );
    });
  }

  private async attachNotification() {
    ble.startNotification(
      this.device_id,
      PopsiclePressure.PRESSURE_SERVICE_UUID,
      PopsiclePressure.PRESSURE_CHAR_UUID,
      async (_data) => {
        const v = new Float64Array(_data);
        const psi = v[0];
        this.setPressure(psiToBar(psi));
      },
      (_data) => {}
    );
  }

  private async deattachNotification() {
    ble.stopNotification(
      this.device_id,
      PopsiclePressure.PRESSURE_SERVICE_UUID,
      PopsiclePressure.PRESSURE_CHAR_UUID,
      (e) => {},
      (e) => {}
    );
  }
}
