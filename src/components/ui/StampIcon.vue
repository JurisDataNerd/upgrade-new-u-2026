<script setup lang="ts">
import {
  PhSparkle,
  PhGraduationCap,
  PhHeartbeat,
  PhShieldCheck,
  PhShieldPlus,
  PhUsersThree,
  PhCompass,
  PhHandshake,
  PhBooks,
  PhArticle,
  PhFlask,
  PhPlant,
  PhRocketLaunch,
  PhCpu,
  PhScales,
  PhProhibit,
  PhFlagBanner,
  PhCrown,
  PhTrophy,
} from '@phosphor-icons/vue';

interface Props {
  name: string;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  weight: 'fill',
  className: '',
});
</script>

<template>
  <component
    :is="
      props.name === 'GraduationCap' || props.name === 'graduation_cap' ? PhGraduationCap :
      props.name === 'Heartbeat' || props.name === 'stethoscope' ? PhHeartbeat :
      props.name === 'ShieldPlus' || props.name === 'shield_plus' ? PhShieldPlus :
      props.name === 'UsersThree' || props.name === 'users_three' ? PhUsersThree :
      props.name === 'Compass' || props.name === 'compass' ? PhCompass :
      props.name === 'ShieldCheck' || props.name === 'shield_check' ? PhShieldCheck :
      props.name === 'Handshake' || props.name === 'handshake' ? PhHandshake :
      props.name === 'Books' || props.name === 'books' ? PhBooks :
      props.name === 'Article' || props.name === 'pen_nib' || props.name === 'PenNib' ? PhArticle :
      props.name === 'Flask' || props.name === 'flask' ? PhFlask :
      props.name === 'Plant' || props.name === 'leaf' || props.name === 'Leaf' ? PhPlant :
      props.name === 'RocketLaunch' || props.name === 'rocket_launch' ? PhRocketLaunch :
      props.name === 'Cpu' || props.name === 'cpu' ? PhCpu :
      props.name === 'Scales' || props.name === 'scales' ? PhScales :
      props.name === 'Prohibit' || props.name === 'prohibit' ? PhProhibit :
      props.name === 'FlagBanner' || props.name === 'flag_banner' ? PhFlagBanner :
      props.name === 'Crown' || props.name === 'CrownSimple' || props.name === 'crown' ? PhCrown :
      props.name === 'Trophy' || props.name === 'trophy' ? PhTrophy :
      PhSparkle
    "
    :size="props.size"
    :weight="props.weight"
    :class="props.className"
  />
</template>
