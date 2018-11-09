<template>
  <span>
    <span v-if="mosaic.mosaicInfo.divisibility">
        <span v-if="mosaic.amount.compact()">
        {{ mosaic.amount.compact().toString().slice(0,-mosaic.mosaicInfo.divisibility) + "." + mosaic.amount.compact().toString().substr(-mosaic.mosaicInfo.divisibility) + mosaic.mosaicName }}
        </span>
        <span v-if="!mosaic.amount.compact()">
        {{ mosaic.amount.compact().toString() + mosaic.mosaicName }}
        </span>
    </span>
    <span v-if="!mosaic.mosaicInfo.divisibility">
        {{ mosaic.amount.compact().toString() + mosaic.mosaicName }}
    </span>
  </span>
</template>

<script>
export default {
	props: {
		mosaic: Object
	}
}
</script>