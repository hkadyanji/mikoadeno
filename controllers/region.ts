import { Context, helpers } from 'https://deno.land/x/oak/mod.ts';
import { Router } from 'https://deno.land/x/oak/mod.ts';
import * as mikoa from 'https://esm.sh/mikoa';
import similarity from 'https://esm.sh/string-similarity';

import { handleSuccess } from '../helpers/request.ts';

const getIndex = (region: string, district: string) => {
  const regions = mikoa.region.all();
  const regionData = similarity.findBestMatch(region.toLowerCase(), regions.map((item) => item.name.toLowerCase()));
  if (!district) {
    return regions[regionData.bestMatchIndex]?.id || 0;
  }

  const districts = mikoa.district.region(regions[regionData.bestMatchIndex]?.id);
  const districtData = similarity.findBestMatch(district.toLowerCase(), districts.map((item) => item.name.toLowerCase()));
  return districts[districtData.bestMatchIndex].id;
};

const handlePosition = async (ctx: Context) => {
  const params = helpers.getQuery(ctx, { mergeParams: true });
  const result = {};

  const regions = mikoa.region.all();

  if (params.region) {
    const regionData = similarity.findBestMatch(params.region.toLowerCase(), regions.map((item) => item.name.toLowerCase()));
    const regionIdx = regionData.bestMatchIndex;
    result['region'] = {
      index: regionIdx,
      ...regions[regionIdx],
    };
  }

  if (params.district) {
    const districts = mikoa.district.region(result['region'].id);

    const districtData = similarity.findBestMatch(params.district.toLowerCase(), districts.map((item) => item.name.toLowerCase()));
    const districtIdx = districtData.bestMatchIndex;

    result['district'] = {
      index: districtIdx,
      ...districts[districtIdx],
    };
  }

  if (params.ward) {
    const wards = mikoa.ward.district(result['district'].id);
    const wardData = similarity.findBestMatch(params.ward.toLowerCase(), wards.map((item) => item.name.toLowerCase()));
    const wardIdx = wardData.bestMatchIndex;

    result['ward'] = {
      index: wardIdx,
      ...wards[wardIdx],
    }
  }

  handleSuccess(ctx, result);
}

const handleRegion = async (ctx: Context) => {
  const regions = mikoa.region.all();
  handleSuccess(ctx, regions);
}

const handleDistrict = async (ctx: Context) => {
  const params = helpers.getQuery(ctx, { mergeParams: true });
  const districts = mikoa.district.region(getIndex(params.region, null));
  handleSuccess(ctx, districts);
}

const handleWard = async (ctx: Context) => {
  const params = helpers.getQuery(ctx, { mergeParams: true });
  const wards = mikoa.ward.district(getIndex(params.region, params.district));
  handleSuccess(ctx, wards);
}

const router = new Router();
router
  .get('/', handleRegion)
  .get('districts', handleDistrict)
  .get('wards', handleWard)
  .get('indexes', handlePosition)

export default router;