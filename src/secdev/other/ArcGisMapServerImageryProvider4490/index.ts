import { ArcGisMapServerImageryProvider, Cartesian2, Credit, defined, DiscardMissingTileImagePolicy, GeographicProjection, Rectangle, Resource } from "cesium";
import GeographicTilingScheme4490 from "./GeographicTilingScheme4490";

export type ConstructorOptions = ArcGisMapServerImageryProvider.ConstructorOptions;

export default class extends ArcGisMapServerImageryProvider {
    options?: ConstructorOptions
    constructor(options: ConstructorOptions) {
        super(options)
        this.options = options
        this.requestMetadata()
    }

    requestMetadata() {
        const self: any = this
        const resource = self._resource.getDerivedResource({
            queryParameters: {
                f: "json",
            },
        });
        if (self.options.url instanceof Resource) {
            resource._url = self.options.url._url;
        } else {
            resource._url = self.options.url;
        }
        const metadata = resource.fetchJson();
        metadata.then((data: any) => {
            self.metadata4490Success(data)
        })
    }

    metadata4490Success(data: any) {
        const tileInfo = data.tileInfo;
        if (data.spatialReference.wkid === 4490 && tileInfo) {
            const self: any = this
            const { options } = this
            if (options) {
                if (data.tileInfo.spatialReference.wkid === 4490) {
                    const geoTilingScheme = new GeographicTilingScheme4490({
                        ellipsoid: options.ellipsoid,
                        tileInfo: tileInfo
                    } as any);
                    self._tilingScheme = geoTilingScheme
                }
                self._maximumLevel = tileInfo.lods.length - 1;
                self._useTiles = true;
                if (defined(data.fullExtent)) {
                    if (
                        defined(data.fullExtent.spatialReference) &&
                        defined(data.fullExtent.spatialReference.wkid)
                    ) {
                        if (data.fullExtent.spatialReference.wkid === 4490) {
                            self._rectangle = Rectangle.fromDegrees(
                                data.fullExtent.xmin,
                                data.fullExtent.ymin,
                                data.fullExtent.xmax,
                                data.fullExtent.ymax
                            );
                        }
                    }
                } else {
                    self._rectangle = self._tilingScheme.rectangle;
                }

                // Install the default tile discard policy if none has been supplied.
                if (!defined(self._tileDiscardPolicy)) {
                    self._tileDiscardPolicy = new DiscardMissingTileImagePolicy({
                        missingImageUrl: self.buildImageResource(self, 0, 0, self._maximumLevel).url,
                        pixelsToCheck: [
                            new Cartesian2(0, 0),
                            new Cartesian2(200, 20),
                            new Cartesian2(20, 200),
                            new Cartesian2(80, 110),
                            new Cartesian2(160, 130),
                        ],
                        disableCheckIfAllPixelsAreTransparent: true,
                    });
                }

            }

            if (defined(data.copyrightText) && data.copyrightText.length > 0) {
                self._credit = new Credit(data.copyrightText);
            }
            self._ready = true;
            self._readyPromise.resolve(true);
        }
    }

    buildImageResource(imageryProvider: any, x: any, y: any, level: any, request: any) {
        var resource;
        if (imageryProvider._useTiles) {
            resource = imageryProvider._resource.getDerivedResource({
                url: "tile/" + level + "/" + y + "/" + x,
                request: request,
            });
        } else {
            var nativeRectangle = imageryProvider._tilingScheme.tileXYToNativeRectangle(
                x,
                y,
                level
            );
            var bbox =
                nativeRectangle.west +
                "," +
                nativeRectangle.south +
                "," +
                nativeRectangle.east +
                "," +
                nativeRectangle.north;

            var query: any = {
                bbox: bbox,
                size: imageryProvider._tileWidth + "," + imageryProvider._tileHeight,
                format: "png32",
                transparent: true,
                f: "image",
            };

            if (
                imageryProvider._tilingScheme.projection instanceof GeographicProjection
            ) {
                query.bboxSR = 4490;
                query.imageSR = 4490;
            } else {
                query.bboxSR = 3857;
                query.imageSR = 3857;
            }
            if (imageryProvider.layers) {
                query.layers = "show:" + imageryProvider.layers;
            }

            resource = imageryProvider._resource.getDerivedResource({
                url: "export",
                request: request,
                queryParameters: query,
            });
        }

        return resource;
    }
}

