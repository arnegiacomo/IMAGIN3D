"use strict";

import * as THREE from "./three.module.js";

export default class TextureSplattingMaterial extends THREE.ShaderMaterial {
  /**
   *
   * @param {Object} options
   * @param {number} options.color
   * @param {number} options.emissive
   * @param {number} options.roughness
   * @param {number} options.metalness
   * @param {THREE.Texture[]} options.colorMaps
   * @param {THREE.Texture[]} options.alphaMaps
   */
  constructor({
    color = 0xffffff,
    emissive = 0x000000,
    roughness = 1.0,
    metalness = 0.0,

    colorMaps = [],
    alphaMaps = [],
  } = {}) {
    if (Math.max(1, colorMaps.length) !== alphaMaps.length + 1) {
      throw Error(
        `There must be exactly one alpha-map less than there are color-maps, found ${colorMaps.length} color-maps and ${alphaMaps.length} alpha-maps.`
      );
    }

    // Setup our uniforms object:
    // If you want to keep the functionality of a built-in material you have to add the appropriate uniforms.
    // You can find the uniforms for built-in shaders here:
    // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib.js
    let uniforms = THREE.UniformsUtils.merge([
      THREE.ShaderLib.standard.uniforms,
      {
        // custom uniforms:
        diffuse: { value: new THREE.Color(color) },
        emissive: { value: new THREE.Color(emissive) },
        roughness: { value: roughness },
        metalness: { value: metalness },
      },
    ]);

    // Setup defines object:
    // The defines variables are usually used to enable/disable functionality in the glsl shaders.
    let defines = {
      STANDARD: "",
    };

    if (colorMaps.length > 0) {
      uniforms.colorMaps = {
        type: "tv",
        value: colorMaps,
      };

      uniforms.colorMapsUvTransforms = {
        type: "Matrix3fv",
        value: colorMaps.map((texture) => {
          texture.updateMatrix();
          return texture.matrix;
        }),
      };

      uniforms.alphaMaps = {
        type: "tv",
        value: alphaMaps,
      };

      defines.USE_ALPHA_MAPS = "";
      defines.USE_UV = "";

      defines.NUMBER_OF_COLOR_MAPS = colorMaps.length;
      defines.NUMBER_OF_ALPHA_MAPS = alphaMaps.length;
    }

    super({
      vertexShader: VERTEX_SHADER,
      fragmentShader: fragmentShader(colorMaps.length),
      uniforms,
      defines,
      fog: true,
      lights: true,
    });
  }
}

/**
 * Noop tagged template literal for syntax hightlighting.
 */
const glsl = (strings, ...expressions) => {
  let result = strings[0];

  for (let i = 1, l = strings.length; i < l; i++) {
    result += expressions[i - 1];
    result += strings[i];
  }

  return result;
};

const VERTEX_SHADER = glsl`
#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
  varying vec3 vWorldPosition;
#endif

// Custom:
#ifdef USE_ALPHA_MAPS
  uniform mat3 colorMapsUvTransforms[NUMBER_OF_COLOR_MAPS];
  varying vec2 colorMapsUvs[NUMBER_OF_COLOR_MAPS]; // Pass to fragment shader.
#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
  // Custom:
  #ifdef USE_ALPHA_MAPS
    for (int i = 0; i < NUMBER_OF_COLOR_MAPS; i++) {
        colorMapsUvs[i] = (colorMapsUvTransforms[i] * vec3(uv, 1)).xy;
    }
  #endif
  #include <uv_vertex>
  #include <uv2_vertex>
  #include <color_vertex>
  #include <morphcolor_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
  #ifdef USE_TRANSMISSION
    vWorldPosition = worldPosition.xyz;
  #endif
}
`;

const fragmentShader = (length) => {
  let expression = glsl`texture2D(colorMaps[0], colorMapsUvs[0])`;
  for (let i = 1; i < length; i++) {
    expression = glsl`mix(
  ${expression},
  texture2D(colorMaps[${i}], colorMapsUvs[${i}]),
  texture2D(alphaMaps[${i - 1}], vUv).r
)`;

      console.log(expression);

  }

  return glsl`
#define STANDARD
#ifdef PHYSICAL
  #define IOR
  #define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
  uniform float ior;
#endif
#ifdef SPECULAR
  uniform float specularIntensity;
  uniform vec3 specularColor;
  #ifdef USE_SPECULARINTENSITYMAP
    uniform sampler2D specularIntensityMap;
  #endif
  #ifdef USE_SPECULARCOLORMAP
    uniform sampler2D specularColorMap;
  #endif
#endif
#ifdef USE_CLEARCOAT
  uniform float clearcoat;
  uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
  uniform float iridescence;
  uniform float iridescenceIOR;
  uniform float iridescenceThicknessMinimum;
  uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
  uniform vec3 sheenColor;
  uniform float sheenRoughness;
  #ifdef USE_SHEENCOLORMAP
    uniform sampler2D sheenColorMap;
  #endif
  #ifdef USE_SHEENROUGHNESSMAP
    uniform sampler2D sheenRoughnessMap;
  #endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

// Custom:
#ifdef USE_ALPHA_MAPS
uniform sampler2D colorMaps[NUMBER_OF_COLOR_MAPS];
uniform sampler2D alphaMaps[NUMBER_OF_ALPHA_MAPS];
// From vertex shader:
varying vec2 colorMapsUvs[NUMBER_OF_COLOR_MAPS];
#endif

void main() {
  #include <clipping_planes_fragment>
  vec4 diffuseColor = vec4( diffuse, opacity );
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>

  // Custom:
  #ifdef USE_ALPHA_MAPS
  vec4 alphaMapColor = ${expression};
  diffuseColor *= alphaMapColor;
  #endif

  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <roughnessmap_fragment>
  #include <metalnessmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <clearcoat_normal_fragment_begin>
  #include <clearcoat_normal_fragment_maps>
  #include <emissivemap_fragment>
  // accumulation
  #include <lights_physical_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  // modulation
  #include <aomap_fragment>
  vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
  #include <transmission_fragment>
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
  #ifdef USE_SHEEN
    // Sheen energy compensation approximation calculation can be found at the end of
    // https://drive.google.com/file/d/1T0D1VSyR4AllqIJTQAraEIzjlb5h4FKH/view?usp=sharing
    float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
    outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
  #endif
  #ifdef USE_CLEARCOAT
    float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
    vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
    outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
  #endif
  #include <output_fragment>
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}
`;
};
