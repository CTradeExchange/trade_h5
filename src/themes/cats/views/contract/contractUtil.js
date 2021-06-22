import dayjs from 'dayjs'

// 交易时间排序及按时区按天归类，返回的时间是处理完时区后的时间
export const sortTimeList = (timeList, utcOffset) => {
    const result = new Array(7).fill('').map(() => [])
    // 时间+时区跨天的添加到下一天
    timeList.forEach(el => {
        const { dayOfWeek, endTime, startTime } = el
        const curDay = result[dayOfWeek - 1]
        const nextDay = result[dayOfWeek === 7 ? 0 : dayOfWeek]
        if (startTime + utcOffset > 1440) { // 开始时间+时区后跨天
            const item = Object.assign({}, el, {
                dayOfWeek: dayOfWeek === 7 ? 0 : dayOfWeek + 1,
                startTime: (startTime + utcOffset - 1440).toFixed(0)
            })
            nextDay.unshift(item)
        } else if (endTime + utcOffset > 1440) { // 结束时间+时区后跨天
            const item = Object.assign({}, el, {
                dayOfWeek: dayOfWeek === 7 ? 1 : dayOfWeek + 1,
                startTime: 0,
                endTime: (endTime + utcOffset - 1440).toFixed(0)
            })
            nextDay.unshift(item)
            const curDayData = Object.assign({}, el, {
                startTime: startTime + utcOffset,
                endTime: 1440,
            })
            curDay.push(curDayData)
        } else {
            const curDayData = Object.assign({}, el, {
                startTime: startTime + utcOffset,
                endTime: endTime + utcOffset,
            })
            curDay.push(curDayData)
        }
    })
    return result
}

// 将时间列表的分钟数格式化成时间字符串
export const timeListFormat = (data) => {
    data.forEach(el => {
        el.forEach(item => {
            const { startTime, endTime } = item
            const startTimeStr = dayjs().utc().startOf('day').add(startTime, 'minute').format('HH:mm')
            const endTimeStr = dayjs().utc().startOf('day').add(endTime, 'minute').format('HH:mm')
            let timeStr = ''
            if (endTime === Number(1440)) {
                timeStr = startTimeStr + '-' + '24:00'
            } else {
                timeStr = startTimeStr + '-' + endTimeStr
            }
            item.timeStr = timeStr
        })
    })
}