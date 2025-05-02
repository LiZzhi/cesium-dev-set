import { defaultValue, defined, Ellipsoid, GeographicProjection, GeographicTilingScheme, Rectangle, Math as CesiumMath, Cartesian2 } from "cesium";

export default class GeographicTilingScheme4490 extends GeographicTilingScheme {
    options: any
    constructor(options: any) {
        super(options)
        this.options = options
        this.init()
    }
    init() {
        const EllipsoidExt: any = Ellipsoid
        EllipsoidExt.CGCS2000 = Object.freeze(new Ellipsoid(6378137.0, 6378137.0, 6356752.31414035585));

        const { options } = this
        const self: any = this
        if (defined(options.tileInfo)
            && defined(options.tileInfo.spatialReference)
            && defined(options.tileInfo.spatialReference.wkid)
            && options.tileInfo.spatialReference.wkid == 4490) {
            self._tileInfo = options.tileInfo;
            self._ellipsoid = defaultValue(options.ellipsoid, EllipsoidExt.CGCS2000);
            self._rectangle = defaultValue(options.rectangle, Rectangle.fromDegrees(-180, -90, 180, 90));
            self._numberOfLevelZeroTilesX = defaultValue(options.numberOfLevelZeroTilesX, 4);
            self._numberOfLevelZeroTilesY = defaultValue(options.numberOfLevelZeroTilesY, 2);
        }
        self._projection = new GeographicProjection(self._ellipsoid);
    }
    override  getNumberOfXTilesAtLevel(level: number) {
        const self: any = this
        if (!defined(self._tileInfo)) {
            return self._numberOfLevelZeroTilesX << level;
        }
        else {
            var currentMatrix = self._tileInfo.lods.filter(function (item: any) {
                return item.level === level;
            });
            var currentResolution = currentMatrix[0].resolution;
            return Math.round(CesiumMath.toDegrees(CesiumMath.TWO_PI) / (self._tileInfo.rows * currentResolution));
        }
    }
    rectangleToNativeRectangle(rectangle: any, result: any) {
        var west = CesiumMath.toDegrees(rectangle.west);
        var south = CesiumMath.toDegrees(rectangle.south);
        var east = CesiumMath.toDegrees(rectangle.east);
        var north = CesiumMath.toDegrees(rectangle.north);

        if (!defined(result)) {
            return new Rectangle(west, south, east, north);
        }

        result.west = west;
        result.south = south;
        result.east = east;
        result.north = north;
        return result;
    };
    tileXYToNativeRectangle(x: number, y: number, level: number, result: any) {
        var rectangleRadians = this.tileXYToRectangle(x, y, level, result);
        rectangleRadians.west = CesiumMath.toDegrees(rectangleRadians.west);
        rectangleRadians.south = CesiumMath.toDegrees(rectangleRadians.south);
        rectangleRadians.east = CesiumMath.toDegrees(rectangleRadians.east);
        rectangleRadians.north = CesiumMath.toDegrees(rectangleRadians.north);
        return rectangleRadians;
    };
    tileXYToRectangle(x: number, y: number, level: number, result: any) {
        const self: any = this
        var rectangle = self._rectangle;

        var west = 0;
        var east = 0;

        var north = 0;
        var south = 0;

        if (defined(self._tileInfo)) {
            var currentMatrix = self._tileInfo.lods.filter(function (item: any) {
                return item.level === level;
            });
            var currentResolution = currentMatrix[0].resolution;

            north = self._tileInfo.origin.y - y * (self._tileInfo.cols * currentResolution);
            west = self._tileInfo.origin.x + x * (self._tileInfo.rows * currentResolution);

            south = self._tileInfo.origin.y - (y + 1) * (self._tileInfo.cols * currentResolution);
            east = self._tileInfo.origin.x + (x + 1) * (self._tileInfo.rows * currentResolution);

            west = CesiumMath.toRadians(west);
            north = CesiumMath.toRadians(north);
            east = CesiumMath.toRadians(east);
            south = CesiumMath.toRadians(south);
        }
        else {
            var xTiles = this.getNumberOfXTilesAtLevel(level);
            var yTiles = this.getNumberOfYTilesAtLevel(level);

            var xTileWidth = rectangle.width / xTiles;
            west = x * xTileWidth + rectangle.west;
            east = (x + 1) * xTileWidth + rectangle.west;

            var yTileHeight = rectangle.height / yTiles;
            north = rectangle.north - y * yTileHeight;
            south = rectangle.north - (y + 1) * yTileHeight;
        }



        if (!defined(result)) {
            result = new Rectangle(west, south, east, north);
        }

        result.west = west;
        result.south = south;
        result.east = east;
        result.north = north;
        return result;
    };
    positionToTileXY(
        position: any,
        level: number,
        result: any
    ) {
        const self: any = this
        var rectangle = self._rectangle;
        if (!Rectangle.contains(rectangle, position)) {
            // outside the bounds of the tiling scheme
            return undefined;
        }

        if (defined(self._tileInfo)) {
            var currentMatrix = self._tileInfo.lods.filter(function (item: any) {
                return item.level === level;
            });
            var currentResolution = currentMatrix[0].resolution;

            var degLon = CesiumMath.toDegrees(position.longitude);
            var degLat = CesiumMath.toDegrees(position.latitude);

            var x_4490 = Math.floor((degLon - self._tileInfo.origin.x) / (self._tileInfo.rows * currentResolution));
            var y_4490 = Math.floor((self._tileInfo.origin.y - degLat) / (self._tileInfo.cols * currentResolution));

            return new Cartesian2(x_4490, y_4490);
        }

        var xTiles = self.getNumberOfXTilesAtLevel(level);
        var yTiles = this.getNumberOfYTilesAtLevel(level);

        var xTileWidth = rectangle.width / xTiles;
        var yTileHeight = rectangle.height / yTiles;

        var longitude = position.longitude;
        if (rectangle.east < rectangle.west) {
            longitude += CesiumMath.TWO_PI;
        }

        var xTileCoordinate = ((longitude - rectangle.west) / xTileWidth) | 0;
        if (xTileCoordinate >= xTiles) {
            xTileCoordinate = xTiles - 1;
        }

        var yTileCoordinate =
            ((rectangle.north - position.latitude) / yTileHeight) | 0;
        if (yTileCoordinate >= yTiles) {
            yTileCoordinate = yTiles - 1;
        }

        if (!defined(result)) {
            return new Cartesian2(xTileCoordinate, yTileCoordinate);
        }

        result.x = xTileCoordinate;
        result.y = yTileCoordinate;
        return result;
    }
}
