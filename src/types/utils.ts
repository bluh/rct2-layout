import { SwitchbackResizable, SwitchbackChild, SwitchbackParent } from "./bases";

/**
 * Checks if an object implements the SwitchbackResizable interface
 * @param object Object to check
 * @returns True if object implements SwitchbackResizable
 */
export function isResizable(object: any): object is SwitchbackResizable {
    return "reactToParentSizeChange" in object;
}


/**
 * Checks if an object implements the SwitchbackParent interface
 * @param object Object to check
 * @returns True if object implements SwitchbackParent
 */
export function isParentOf<ChildType extends SwitchbackChild>(object: any): object is SwitchbackParent<ChildType> {
    return "children" in object;
}


export function getChildrenFlatRecurse<ChildType extends SwitchbackChild>(children: ChildType[]): ChildType[] {
    const result: ChildType[] = [];
    children.forEach(child => {
        result.push(child);
        if (isParentOf<ChildType>(child)) {
            result.push(...getChildrenFlatRecurse<ChildType>(child.children));
        }
    });
    return result;
}