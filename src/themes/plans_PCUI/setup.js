// element-plus
import 'element-plus/dist/index.css'
import {
    ElLoading,
    ElDialog,
    ElMessageBox,
    ElMessage,
    ElCarousel,
    ElCarouselItem,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
    ElTimeline,
    ElEmpty,
    ElPopover,
    ElTimelineItem,
    ElTable,
    ElSelect,
    ElOption,
    ElOptionGroup,
    ElTableColumn
} from 'element-plus'

export default function (app) {
    app.use(ElLoading).use(ElDialog).use(ElMessageBox).use(ElMessage).use(ElCarousel).use(ElCarouselItem).use(ElDropdown)
        .use(ElDropdownMenu).use(ElDropdownItem).use(ElTimeline).use(ElTimelineItem).use(ElEmpty).use(ElPopover).use(ElTable).use(ElTableColumn)
        .use(ElSelect).use(ElOption).use(ElOptionGroup)
};