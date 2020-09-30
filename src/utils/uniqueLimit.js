export function isRegistNameOrId(sourceArray, index, key, value) {
  // 添加项目时需检测id或者name是否唯一
  // sourceArr: 已经添加的所有条目
  // index: 当前条目index，用于判断编辑或是新增
  // key: 当前检测的key(id或name)
  // value: 当前需检测的值
  if (!sourceArray || !value) {
    return false
  }
  let editArray = sourceArray
  if (index !== -1) {  // 如果是编辑，将检测除当前id以外的id是否与重复当前id重复
    editArray = editArray.filter(item => item[key] !== sourceArray[index][key])
  }
  return editArray.findIndex(item => item[key] === value) > -1
}
