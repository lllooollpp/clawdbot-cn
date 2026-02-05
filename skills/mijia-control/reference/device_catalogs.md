# Mijia Device Reference Catalog

该文档记录了常用设备的型号与其属性对应关系，用于减少动态查询次数。

## 照明类 (Lighting)

### 型号: `lumi.switch.b2nacn02`
- **名称**: Aqara智能墙壁开关 D1（零火双键版）
- **属性**:
    - `on`: 左键开关 (bool)
    - `switch-on`: 右键开关 (bool)
    - `electric-power`: 当前功率 (float, Watt)
- **动作**:
    - `toggle`: 切换左键
    - `switch-toggle`: 切换右键

### 型号: `lumi.switch.b1nacn02`
- **名称**: Aqara智能墙壁开关 D1（零火单键版）
- **属性**:
    - `on`: 开关状态 (bool)

## 环境类 (Environment)

### 型号: `zhimi.airpurifier.ma2`
- **名称**: 米家空气净化器 2
- **属性**:
    - `on`: 开关 (bool)
    - `mode`: 运行模式 (0:Auto, 1:Silent, 2:Favorite)
    - `pm25_density`: PM2.5 浓度 (int)

---
*注：可通过 `python -m mijiaAPI --get_device_info <MODEL>` 持续更新此表。*
