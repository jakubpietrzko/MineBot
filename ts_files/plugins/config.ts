export let gpt = true;
export function set_gpt(state: boolean)
{
gpt = state;
}
export let guide_b = false;
export let guide_d = '';
export function set_guide(state: boolean, guide: string)
{
guide_b = state;
guide_d = guide;
} 