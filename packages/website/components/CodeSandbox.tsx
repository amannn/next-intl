type Props = {
  src: string;
  title: string;
};

export default function CodeSandbox({src, title}: Props) {
  return (
    <iframe
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-autoplay allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      src={src}
      style={{
        width: '100%',
        height: '100%',
        border: 0,
        overflow: 'hidden',
        background: 'rgb(21, 21, 21)'
      }}
      title={'next-intl - ' + title}
    />
  );
}
