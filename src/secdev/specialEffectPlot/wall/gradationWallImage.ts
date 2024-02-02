
export type colorOptionType = Record<number, string>;

export default function(colorOption?: colorOptionType) {
    if (!colorOption) {
        colorOption = {
            0.0: "blue",
            0.1: "cyan",
            0.37: "lime",
            0.54: "yellow",
            1: "red",
        }
    }
	const ramp = document.createElement("canvas");
	ramp.width = 1;
	ramp.height = 100;
	let ctx = ramp.getContext("2d")!;
	let grd = ctx.createLinearGradient(0, 0, 0, 100);
	for (let key in colorOption) {
		grd.addColorStop(1 - Number(key), colorOption[key]);
	}
	ctx.fillStyle = grd;
	ctx.fillRect(0, 0, 1, 100);
	return ramp;
}