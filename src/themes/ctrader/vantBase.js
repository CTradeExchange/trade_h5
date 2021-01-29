import { Button, popup, Dialog, Cell, CellGroup, Stepper, Checkbox, CheckboxGroup, Tab, Tabs, ActionSheet, Swipe, SwipeItem, Icon, DatetimePicker } from 'vant'

const components = [Button, popup, Dialog, Cell, CellGroup, Stepper, Checkbox, CheckboxGroup, Tab, Tabs, ActionSheet, Swipe, SwipeItem, Icon, DatetimePicker]
const install = (app, options) => {
    console.log(app, options, components)
    components.forEach(component => {
        app.use(component)
    })
}
export default {
    install
}
